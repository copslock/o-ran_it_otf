/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


package org.oran.otf.api.service.impl;

import org.oran.otf.api.Utilities;
import org.oran.otf.api.handler.CamundaProcessDeploymentHandler;
import org.oran.otf.api.service.TestStrategyService;
import org.oran.otf.common.model.TestDefinition;
import org.oran.otf.common.model.User;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.model.local.DeployTestStrategyRequest;
import org.oran.otf.common.model.local.OTFApiResponse;
import org.oran.otf.common.repository.GroupRepository;
import org.oran.otf.common.repository.TestDefinitionRepository;
import org.oran.otf.common.repository.UserRepository;
import org.oran.otf.common.utility.http.ResponseUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Hidden;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Optional;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.http.HttpResponse;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.util.EntityUtils;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Hidden
public class TestStrategyServiceImpl implements TestStrategyService {

  private static final Logger logger = LoggerFactory.getLogger(TestStrategyServiceImpl.class);

  @Autowired private TestDefinitionRepository testDefinitionRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private CamundaProcessDeploymentHandler camundaProcessDeploymentHandler;

  @Autowired private GroupRepository groupRepository;

  public Response deployTestStrategy(
      InputStream bpmn,
      InputStream compressedResources,
      String testDefinitionId,
      String testDefinitionDeployerId,
      String definitionId,
      String authorization) {
    if (bpmn == null)
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "BPMN input stream cannot be null.");

    // Decode the authorization header.
    byte[] decodedAuthorization = Base64.getDecoder().decode(authorization.replace("Basic ", ""));
    String credentials = new String(decodedAuthorization);
    String[] credentialsArray = credentials.split(":");

    /* Check if the request came from the system specified mechanized identifier. The request goes through AAF
     * authorization before reaching this code, therefore, assume the headers aren't spoofed. */
    if (!credentialsArray[0].equals(System.getenv("AAF_ID")))
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "Unauthorized to use this service.");

    // Map to a POJO model2.
    ObjectId _testDefinitionDeployerId = null;
    ObjectId _testDefinitionId = null;

    if (testDefinitionDeployerId != null && ObjectId.isValid(testDefinitionDeployerId))
      _testDefinitionDeployerId = new ObjectId(testDefinitionDeployerId);
    if (testDefinitionId != null && ObjectId.isValid(testDefinitionId))
      _testDefinitionId = new ObjectId(testDefinitionId);

    DeployTestStrategyRequest request =
        new DeployTestStrategyRequest(_testDefinitionDeployerId, _testDefinitionId, definitionId);

    //		String bpmnContents = null;
    //		try (final Reader reader = new InputStreamReader(bpmn)) {
    //			bpmnContents = CharStreams.toString(reader);
    //	 		} catch (Exception e) {
    //			e.printStackTrace();
    //		}

    // Check if the request actually contains a bpmn string.
    //		try {
    //			if (bpmnContents == null || bpmnContents.trim().length() == 0)
    //				return Utilities.Http.BuildResponse.badRequestWithMessage("BPMN contents are null.");
    //		} catch (Exception e) {
    //			logger.error(Utilities.getStackTrace(e));
    //		}

    // If a test definition id is supplied, the request intends to  updatean existing test
    // definition.
    if (request.getTestDefinitionId() != null) {
      // Check if the test definition exists in the database.
      Optional<TestDefinition> testDefinitionOptional =
          testDefinitionRepository.findById(request.getTestDefinitionId().toString());

      if (!testDefinitionOptional.isPresent())
        return Utilities.Http.BuildResponse.badRequestWithMessage(
            String.format("Test definition (%s) was not found.", request.getTestDefinitionId()));

      // Check if a user to update the definition was supplied.
      if (request.getTestDefinitionDeployerId() == null)
        return Utilities.Http.BuildResponse.badRequestWithMessage(
            "Must specify testDefinitionDeployerId.");

      // Check if the user requesting to update the definition is the user who originally created
      // the definition.
      TestDefinition testDefinition = testDefinitionOptional.get();

      if (!testDefinition
          .getCreatedBy()
          .toString()
          .equals(request.getTestDefinitionDeployerId().toString()))
        return Utilities.Http.BuildResponse.badRequestWithMessage(
            String.format(
                "User (%s) is not authorized to update this test definition.",
                request.getTestDefinitionDeployerId()));

      // Check if the version to deploy already exists
      for (BpmnInstance bpmnInstance : testDefinition.getBpmnInstances()) {
        if (bpmnInstance.getProcessDefinitionId().equalsIgnoreCase(request.getDefinitionId()))
          return Utilities.Http.BuildResponse.badRequestWithMessage(
              String.format(
                  "A deployment with the definitionId %s already exists.",
                  request.getDefinitionId()));
      }
    }

    // Make the deployment request to Camunda. Relay the response received by Camunda.
    return camundaProcessDeploymentHandler.start(bpmn, compressedResources);
  }

  public Response deleteByDeploymentId(String deploymentId, String authorization) {
    User user = Utilities.findUserByAuthHeader(authorization, userRepository);
    if (!isAuthorized(authorization)) {
      return Utilities.Http.BuildResponse.unauthorized();
    }

    String url =
        String.format(
            "%s:%s/%s/%s",
            System.getenv("otf.camunda.host"),
            System.getenv("otf.camunda.port"),
            System.getenv("otf.camunda.deploymentDeletionUri"),
            deploymentId);

    try {
      HttpResponse res = Utilities.Http.httpDeleteAAF(url);
      String resStr = EntityUtils.toString(res.getEntity());
      int status = res.getStatusLine().getStatusCode();
      return Response.status(status)
          .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(status, resStr))
          .build();

    } catch (Exception e) {
      e.printStackTrace();
      return Utilities.Http.BuildResponse.internalServerError();
    }
  }

  public Response deleteByTestDefinitionId(String testDefinitionId, String authorization) {
    User user = Utilities.findUserByAuthHeader(authorization, userRepository);
    if (!isAuthorized(authorization)) {
      return Utilities.Http.BuildResponse.unauthorizedWithMessage("Authorization headers not set.");
    }

    String url =
        String.format(
            "%s:%s/%s/%s",
            System.getenv("otf.camunda.host"),
            System.getenv("otf.camunda.port"),
            System.getenv("otf.camunda.testDefinitionDeletionUri"),
            testDefinitionId);

    try {
      HttpResponse res = Utilities.Http.httpDeleteAAF(url);
      String resStr = EntityUtils.toString(res.getEntity());
      int status = res.getStatusLine().getStatusCode();
      return Response.status(status)
          .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(status, resStr))
          .build();
    } catch (HttpHostConnectException e) {
      return ResponseUtility.Build.serviceUnavailableWithMessage(e.getMessage());
    } catch (Exception e) {
      e.printStackTrace();
      return Utilities.Http.BuildResponse.internalServerError();
    }
  }

  private boolean isAuthorized(String authorization) {
    User user = Utilities.findUserByAuthHeader(authorization, userRepository);
    return (user.getEmail().equalsIgnoreCase(System.getenv("AAF_ID")));
  }

  private DeployTestStrategyRequest mapToDeployTestStrategyRequest(String body) {
    ObjectMapper mapper = new ObjectMapper();
    try {
      return mapper.readValue(body, DeployTestStrategyRequest.class); // Perform the mapping
    } catch (IOException e) { // Indicates an unknown request body
      logger.error(e.getMessage());
      return null;
    }
  }
}

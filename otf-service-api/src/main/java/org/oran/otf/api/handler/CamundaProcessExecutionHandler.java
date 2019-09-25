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


package org.oran.otf.api.handler;

import org.oran.otf.api.Utilities;
import org.oran.otf.api.Utilities.LogLevel;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.local.OTFApiResponse;
import org.oran.otf.common.model.local.WorkflowRequest;
import org.oran.otf.common.utility.gson.Convert;
import org.oran.otf.common.utility.http.ResponseUtility;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class CamundaProcessExecutionHandler {
  private static final Logger logger =
      LoggerFactory.getLogger(CamundaProcessExecutionHandler.class);

  private CamundaProcessExecutionHandler() {
    // prevent instantiation
  }

  public Response startProcessInstance(WorkflowRequest request) throws Exception {
    try {
      //      if (!Utilities.Camunda.isCamundaOnline()) {
      //        Utilities.Http.BuildResponse.internalServerErrorWithMessage(
      //            "Unable to start process instance because the test control unit is
      // unavailable.");
      //      }

      // Read necessary environment variables - Avoiding using Spring dependencies (@Value)
      String host = System.getenv("otf.camunda.host");
      String path = System.getenv("otf.camunda.uri.execute-test");
      int port = Utilities.TryGetEnvironmentVariable("otf.camunda.port");

      if (!Utilities.isHostValid(host)) {
        logger.error(String.format("Host (%s) must use either the http or https protocol.", host));
        return null;
      }

      if (!Utilities.isPortValid(port)) {
        logger.error(
            String.format(
                "Invalid port (%s) specified as environment variable 'otf.camunda.port'.",
                System.getenv("otf.camunda.port")));
        return null;
      }

      // Form the URL
      String postUrl = String.format("%s:%s/%s", host, port, path);

      // Send and store the response
      HttpResponse response = Utilities.Http.httpPostJsonUsingAAF(postUrl, request.toString());
      // Get the entity and attempt to convert it to a TestExecution object.
      HttpEntity entity = response.getEntity();
      String rawEntity = EntityUtils.toString(entity);
      ObjectMapper mapper = new ObjectMapper();
      OTFApiResponse otfApiResponse = mapper.readValue(rawEntity, OTFApiResponse.class);

      if (otfApiResponse.getStatusCode() == 400) {
        return Response.status(400)
            .type(MediaType.APPLICATION_JSON_TYPE)
            .entity(otfApiResponse.toString())
            .build();
      }

      String jsonMessage = otfApiResponse.getMessage();
      TestExecution testExecution =
          Convert.jsonToObject(jsonMessage, new TypeReference<TestExecution>() {});
      return Response.status(otfApiResponse.getStatusCode())
          .entity(testExecution.toString())
          .build();

    } catch (HttpHostConnectException e) {
      return ResponseUtility.Build.serviceUnavailableWithMessage(e.getMessage());
    } catch (Exception e) {
      Utilities.printStackTrace(e, LogLevel.ERROR);
      return ResponseUtility.Build.internalServerError();
    }
  }
}

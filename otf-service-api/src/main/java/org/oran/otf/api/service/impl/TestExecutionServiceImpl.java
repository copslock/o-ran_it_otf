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
import org.oran.otf.api.service.TestExecutionService;
import org.oran.otf.common.model.Group;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.User;
import org.oran.otf.common.repository.GroupRepository;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.repository.UserRepository;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.UserPermission;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.Optional;
import java.util.UUID;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestExecutionServiceImpl implements TestExecutionService {
  private static final Logger logger = LoggerFactory.getLogger(TestExecutionServiceImpl.class);
  @Autowired
  private UserRepository userRepository;
  @Autowired private TestExecutionRepository testExecutionRepository;
  @Autowired private GroupRepository groupRepository;

  @Override
  public Response getExecutionStatus(String authorization, String executionId) {
    if (authorization == null) {
      return Utilities.Http.BuildResponse.unauthorizedWithMessage("Missing authorization header.");
    }
    // check if the executionId is a valid UUID
    try {
      UUID.fromString(executionId);
    } catch (IllegalArgumentException e) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "Invalid execution identifier. Expected type is UUID (v4).");
    }

    // try to find the test execution
    Optional<TestExecution> optionalTestExecution =
        testExecutionRepository.findFirstByProcessInstanceId(executionId);
    TestExecution testExecution = Utilities.resolveOptional(optionalTestExecution);
    if (testExecution == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          String.format("An execution with identifier %s was not found.", executionId));
    }

    // try to find the group of the test execution
    String testExecutionGroupId = testExecution.getGroupId().toString();
    Optional<Group> optionalGroup = groupRepository.findById(testExecutionGroupId);
    Group group = Utilities.resolveOptional(optionalGroup);
    if (group == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          String.format(
              "The group (id: %s) associated with the test execution does not exist.",
              testExecutionGroupId));
    }

    // try to find the user for the mechanizedId used to make this request
    User user = Utilities.findUserByAuthHeader(authorization, userRepository);
    if (user == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "No user associated with mechanized identifier used for this request.");
    }
    // if it doesnt have read permission then return bad request
    if (!PermissionChecker.hasPermissionTo(user,group, UserPermission.Permission.READ,groupRepository)){
      return Utilities.Http.BuildResponse.unauthorizedWithMessage(
          "Unauthorized to view this test execution.");
    }
    // Used the build the final response to be returned
    JsonObject res = new JsonObject();
    try {
      // Parsing is required to prevent Gson from escaping all the characters of the json
      JsonElement testExecutionParsed = new JsonParser().parse(testExecution.toString());
      res.add("testExecution", testExecutionParsed);
      // Get the state of the process instance using the Camunda REST API
      JsonObject procInstStatus = Utilities.Camunda.processInstanceStatus(executionId);
      // Extract the state of the process instance from the JSON response
      String processInstanceState =
          procInstStatus.getAsJsonObject("historicProcessInstance").get("state").getAsString();
      // Add the result to the final response
      res.addProperty("state", processInstanceState);
    } catch (NullPointerException npe) {
      // In the case of a null pointer exception, make it clear that the state was not able
      // to be determined using the Camunda API.
      logger.error("Unable to determine the live status of the test execution.");
      res.addProperty("state", "Unable to determine");
    }
    // Send the response
    return Response.ok(res.toString()).build();
  }

  @Override
  public Response getExecution(String authorization, String processInstanceId) {
    try {
      UUID.fromString(processInstanceId);
    } catch (IllegalArgumentException e) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "Invalid execution identifier. Expected type is UUID (v4).");
    }

    // try to find the test execution
    Optional<TestExecution> optionalTestExecution =
        testExecutionRepository.findFirstByProcessInstanceId(processInstanceId);
    TestExecution testExecution = Utilities.resolveOptional(optionalTestExecution);
    if (testExecution == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          String.format("An execution with identifier %s was not found.", processInstanceId));
    }

    // try to find the group of the test execution
    String testExecutionGroupId = testExecution.getGroupId().toString();
    Optional<Group> optionalGroup = groupRepository.findById(testExecutionGroupId);
    Group group = Utilities.resolveOptional(optionalGroup);
    if (group == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          String.format(
              "The group (id: %s) associated with the test execution does not exist.",
              testExecutionGroupId));
    }

    // try to find the user for the mechanizedId used to make this request
    User user = Utilities.findUserByAuthHeader(authorization, userRepository);
    if (user == null) {
      return Utilities.Http.BuildResponse.badRequestWithMessage(
          "No user associated with mechanized identifier used" + " for this request.");
    }

    // if it doesnt have read permission then return bad request
    if (!PermissionChecker.hasPermissionTo(user,group,UserPermission.Permission.READ,groupRepository)){
      return Utilities.Http.BuildResponse.unauthorizedWithMessage(
          "Unauthorized to view this test execution.");
    }

    return Response.ok(testExecution.toString()).build();
  }
}

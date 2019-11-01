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
import org.oran.otf.api.Utilities.LogLevel;
import org.oran.otf.api.handler.CamundaProcessExecutionHandler;
import org.oran.otf.api.service.TestInstanceService;
import org.oran.otf.common.model.Group;
import org.oran.otf.common.model.TestDefinition;
import org.oran.otf.common.model.TestInstance;
import org.oran.otf.common.model.User;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.model.local.TestInstanceCreateRequest;
import org.oran.otf.common.model.local.WorkflowRequest;
import org.oran.otf.common.repository.GroupRepository;
import org.oran.otf.common.repository.TestDefinitionRepository;
import org.oran.otf.common.repository.TestInstanceRepository;
import org.oran.otf.common.repository.UserRepository;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.database.Generic;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.UserPermission;
import com.google.common.base.Strings;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;

@Service
public class TestInstanceServiceImpl implements TestInstanceService {
    @Autowired
    CamundaProcessExecutionHandler camundaProcessExecutionHandler;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TestInstanceRepository testInstanceRepository;
    @Autowired
    TestDefinitionRepository testDefinitionRepository;
    @Autowired
    GroupRepository groupRepository;

    private static final Logger logger = LoggerFactory.getLogger(TestInstanceServiceImpl.class);
    private static final String logPrefix = Utility.getLoggerPrefix();

    @Override
    public Response execute(String testInstanceId, String authorization, WorkflowRequest request) {
        try {
            if (request == null) {
                return ResponseUtility.Build.badRequestWithMessage("Request body is null.");
            }

            // Check if the testInstanceId is a valid BSON ObjectI, otherwise return a bad request
            // response.
            if (!Utilities.isObjectIdValid(testInstanceId)) {
                String error =
                        String.format(
                                "%sThe testInstanceId, %s, is not a valid ObjectId (BSON).",
                                logPrefix, testInstanceId);
                return ResponseUtility.Build.badRequestWithMessage(error);
            }

            // Create an ObjectId now that we know the provided String was valid.
            ObjectId oiTestInstanceId = new ObjectId(testInstanceId);
            // Check if the testInstance exists, otherwise return a not found response.
            TestInstance testInstance = Generic.findByIdGeneric(testInstanceRepository, oiTestInstanceId);
            if (testInstance == null) {
                String error =
                        String.format(
                                "%sThe testInstance with _id, %s, was not found.", logPrefix, testInstanceId);
                return ResponseUtility.Build.notFoundWithMessage(error);
            }
            // Check if the testDefinition exists.
            TestDefinition testDefinition =
                    Generic.findByIdGeneric(testDefinitionRepository, testInstance.getTestDefinitionId());
            if (testDefinition == null) {
                String error =
                        String.format(
                                "%sThe testDefinition with _id, %s, was not found.",
                                logPrefix, testInstance.getTestDefinitionId().toString());
                return ResponseUtility.Build.notFoundWithMessage(error);
            }

            // Check if a user associated with the mechanizedId used in the authorization header exists in
            // the database.
            User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
            if (mechanizedIdUser == null) {
                String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
                if (decodedAuth == null) {
                    return ResponseUtility.Build.badRequestWithMessage(
                            String.format("Unable to decode authorization header: %s", authorization));
                }
                String error =
                        String.format(
                                "%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // If the mechanizedId is not an OTF mechanizedId, check if the user is authorized to
            // execute
            // the test instance. This is required because the executorId only needs to be read from the
            // otf-frontend component. The user/group system is not fully integrated with AAF, so this
            // is
            // required. A better way might be to use certificates to check identities.
            Group testInstanceGroup = Utilities.resolveOptional(groupRepository.findById(testInstance.getGroupId().toString()));
            // if we cant find the test instance group then we cant check the permission
            if (testInstanceGroup == null) {
                return ResponseUtility.Build.
                        badRequestWithMessage(
                                String.format("Can not find test instance group, id:%s", testInstance.getGroupId().toString()));
            }
            // If the mechanizedId is authorized, set the executorId in the WorkflowRequest to the
            // mechanizedId's ObjectId to make sure that the executorId isn't spoofed. Only use the
            // executorId sent with the request if it uses the OTF mechanizedId because we "trust" it.
            if (isOtfMechanizedIdentifier(mechanizedIdUser.getEmail()) && request.getExecutorId() != null) {
                mechanizedIdUser = Utilities.resolveOptional(userRepository.findById(request.getExecutorId().toString()));
            } else {
                request.setExecutorId(mechanizedIdUser.get_id());
            }
            if (!PermissionChecker.hasPermissionTo(mechanizedIdUser,testInstanceGroup, UserPermission.Permission.EXECUTE,groupRepository)) {
                String error =
                        String.format(
                                "%sUnauthorized the execute test instance with _id, %s.",
                                logPrefix, testInstanceId);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // Set the test instance _id after authorization.
            request.setTestInstanceId(testInstance.get_id());

            // Check if the test instance is disabled.
            if (testInstance.isDisabled()) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("The test instance with identifier %s is disabled.", testInstanceId));
            }
            // Check if the test definition is disabled.
            if (testDefinition.isDisabled()) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format(
                                "The test definition with identifier %s is disabled.",
                                testInstance.getTestDefinitionId().toString()));
            }

            // Send the request to Camunda.
            return camundaProcessExecutionHandler.startProcessInstance(request);
        } catch (Exception e) {
            Utilities.printStackTrace(e, LogLevel.ERROR);
            return ResponseUtility.Build.internalServerError();
        }
    }

    @Override
    public Response createByTestDefinitionId(
            String testDefinitionId, String authorization, TestInstanceCreateRequest request) {
        try {
            // Check if a user associated with the mechanizedId used in the authorization header exists in
            // the database.
            User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
            if (mechanizedIdUser == null) {
                String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
                if (decodedAuth == null) {
                    return ResponseUtility.Build.badRequestWithMessage(
                            String.format("Unable to decode authorization header: %s", authorization));
                }
                String error =
                        String.format(
                                "%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // Check if the String correctly parses as an ObjectId.
            if (!Utilities.isObjectIdValid(testDefinitionId)) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format(
                                "The testDefinitionId %s is not a valid BSON ObjectId.", testDefinitionId));
            }
            ObjectId oiTestDefintionId = new ObjectId(testDefinitionId);

            // Find the testDefinition
            TestDefinition testDefinition =
                    Generic.findByIdGeneric(testDefinitionRepository, oiTestDefintionId);
            if (testDefinition == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format("Test definition with id, %s, was not found.", testDefinitionId));
            }
            // Check if the mechanizedId has access to the test definition.
            Group testDefGroup = Utilities.resolveOptional(groupRepository.findById(testDefinition.getGroupId().toString()));
            if (testDefGroup == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Can not find test definition's group, id: %s", testDefinition.getGroupId().toString()));
            }
//            if (PermissionChecker.hasReadPermission(mechanizedIdUser, testDefGroup, groupRepository)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have read access to test definition in group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
//            if (PermissionChecker.hasWritePermission(mechanizedIdUser, testDefGroup)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have write access to the group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
            if (PermissionChecker.hasPermissionTo(mechanizedIdUser, testDefGroup,
                    Arrays.asList(UserPermission.Permission.READ,UserPermission.Permission.WRITE),groupRepository))
            {
                return ResponseUtility.Build.unauthorizedWithMessage(
                        String.format(
                                "MechanizedId, %s, does not have access (read/write) to the group with name, %s",
                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
            }
            // Get the latest version of the test definition to link it with the test instance
            BpmnInstance bpmnInstance = findBpmnInstance(testDefinition, Integer.MIN_VALUE, true);
            if (bpmnInstance == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with id, %s, does not have any versions associated with it.",
                                testDefinitionId));
            }

            TestInstance testInstance =
                    new TestInstance(
                            new ObjectId(),
                            request.getTestInstanceName(),
                            request.getTestInstanceDescription(),
                            testDefinition.getGroupId(),
                            testDefinition.get_id(),
                            bpmnInstance.getProcessDefinitionId(),
                            request.isUseLatestTestDefinition(),
                            false,
                            request.isSimulationMode(),
                            request.getMaxExecutionTimeInMillis(),
                            request.getPfloInput(),
                            new HashMap<>(),
                            request.getSimulationVthInput(),
                            request.getTestData(),
                            request.getVthInput(),
                            new Date(System.currentTimeMillis()),
                            new Date(System.currentTimeMillis()),
                            mechanizedIdUser.get_id(),
                            mechanizedIdUser.get_id());

            return Response.ok()
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(testInstance.toString())
                    .build();
        } catch (Exception e) {
            Utilities.printStackTrace(e, LogLevel.ERROR);
            return ResponseUtility.Build.internalServerError();
        }
    }

    @Override
    public Response createByTestDefinitionId(
            String testDefinitionId,
            int version,
            String authorization,
            TestInstanceCreateRequest request) {
        try {
            // Check if a user associated with the mechanizedId used in the authorization header exists in
            // the database.
            User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
            if (mechanizedIdUser == null) {
                String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
                if (decodedAuth == null) {
                    return ResponseUtility.Build.badRequestWithMessage(
                            String.format("Unable to decode authorization header: %s", authorization));
                }
                String error =
                        String.format(
                                "%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // Check if the String correctly parses as an ObjectId.
            if (!Utilities.isObjectIdValid(testDefinitionId)) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format(
                                "The testDefinitionId %s is not a valid BSON ObjectId.", testDefinitionId));
            }
            ObjectId oiTestDefintionId = new ObjectId(testDefinitionId);

            // Find the testDefinition
            TestDefinition testDefinition =
                    Generic.findByIdGeneric(testDefinitionRepository, oiTestDefintionId);
            if (testDefinition == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format("Test definition with id, %s, was not found.", testDefinitionId));
            }
            // permission checking
            Group testDefGroup = Utilities.resolveOptional(groupRepository.findById(testDefinition.getGroupId().toString()));
            if (testDefGroup == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Can not find test definition's group, id: %s", testDefinition.getGroupId().toString()));
            }
            // if not otf email and is not authorized
//            if (PermissionChecker.hasReadPermission(mechanizedIdUser, testDefGroup, groupRepository)) {
////                return ResponseUtility.Build.unauthorizedWithMessage(
////                        String.format(
////                                "MechanizedId, %s, does not have read access to test definition in group with name, %s",
////                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
////            }
////            if (PermissionChecker.hasWritePermission(mechanizedIdUser, testDefGroup)) {
////                return ResponseUtility.Build.unauthorizedWithMessage(
////                        String.format(
////                                "MechanizedId, %s, does not have write access to the group with name, %s",
////                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
////            }
            if (PermissionChecker.hasPermissionTo(mechanizedIdUser, testDefGroup,
                    Arrays.asList(UserPermission.Permission.READ,UserPermission.Permission.WRITE),groupRepository))
            {
                return ResponseUtility.Build.unauthorizedWithMessage(
                        String.format(
                                "MechanizedId, %s, does not have access (read/write) to the group with name, %s",
                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
            }
            // Get the latest version of the test definition to link it with the test instance
            BpmnInstance bpmnInstance = findBpmnInstance(testDefinition, version, false);
            if (bpmnInstance == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with id, %s, does not have any versions associated with it.",
                                testDefinitionId));
            }

            TestInstance testInstance =
                    new TestInstance(
                            new ObjectId(),
                            request.getTestInstanceName(),
                            request.getTestInstanceDescription(),
                            testDefinition.getGroupId(),
                            testDefinition.get_id(),
                            bpmnInstance.getProcessDefinitionId(),
                            request.isUseLatestTestDefinition(),
                            false,
                            request.isSimulationMode(),
                            request.getMaxExecutionTimeInMillis(),
                            request.getPfloInput(),
                            new HashMap<>(),
                            request.getSimulationVthInput(),
                            request.getTestData(),
                            request.getVthInput(),
                            new Date(System.currentTimeMillis()),
                            new Date(System.currentTimeMillis()),
                            mechanizedIdUser.get_id(),
                            mechanizedIdUser.get_id());

            return Response.ok()
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(testInstance.toString())
                    .build();
        } catch (Exception e) {
            Utilities.printStackTrace(e, LogLevel.ERROR);
            return ResponseUtility.Build.internalServerError();
        }
    }

    @Override
    public Response createByProcessDefinitionKey(
            String processDefinitionKey, String authorization, TestInstanceCreateRequest request) {
        try {
            // Check if a user associated with the mechanizedId used in the authorization header exists in
            // the database.
            User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
            if (mechanizedIdUser == null) {
                String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
                if (decodedAuth == null) {
                    return ResponseUtility.Build.badRequestWithMessage(
                            String.format("Unable to decode authorization header: %s", authorization));
                }
                String error =
                        String.format(
                                "%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // Check if the String correctly parses as an ObjectId.
            if (Strings.isNullOrEmpty(processDefinitionKey)) {
                return ResponseUtility.Build.badRequestWithMessage("The processDefinitionKey is required.");
            }

            // Find the testDefinition
            TestDefinition testDefinition =
                    testDefinitionRepository.findByProcessDefinitionKey(processDefinitionKey).orElse(null);
            if (testDefinition == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with processDefinitionKey, %s, was not found.",
                                processDefinitionKey));
            }

            Group testDefGroup = Utilities.resolveOptional(groupRepository.findById(testDefinition.getGroupId().toString()));
            if (testDefGroup == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Can not find test definition's group, id: %s", testDefinition.getGroupId().toString()));
            }
            // if not otf email and is not authorized
//            if (PermissionChecker.hasReadPermission(mechanizedIdUser, testDefGroup, groupRepository)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have read access to test definition in group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
//            if (PermissionChecker.hasWritePermission(mechanizedIdUser, testDefGroup)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have write access to the group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
            if (PermissionChecker.hasPermissionTo(mechanizedIdUser, testDefGroup,
                    Arrays.asList(UserPermission.Permission.READ,UserPermission.Permission.WRITE),groupRepository))
            {
                return ResponseUtility.Build.unauthorizedWithMessage(
                        String.format(
                                "MechanizedId, %s, does not have access (read/write) to the group with name, %s",
                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
            }
            // Get the latest version of the test definition to link it with the test instance
            BpmnInstance bpmnInstance = findBpmnInstance(testDefinition, Integer.MIN_VALUE, false);
            if (bpmnInstance == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with id, %s, does not have any versions associated with it.",
                                testDefinition.get_id().toString()));
            }

            TestInstance testInstance =
                    new TestInstance(
                            new ObjectId(),
                            request.getTestInstanceName(),
                            request.getTestInstanceDescription(),
                            testDefinition.getGroupId(),
                            testDefinition.get_id(),
                            bpmnInstance.getProcessDefinitionId(),
                            request.isUseLatestTestDefinition(),
                            false,
                            request.isSimulationMode(),
                            request.getMaxExecutionTimeInMillis(),
                            request.getPfloInput(),
                            new HashMap<>(),
                            request.getSimulationVthInput(),
                            request.getTestData(),
                            request.getVthInput(),
                            new Date(System.currentTimeMillis()),
                            new Date(System.currentTimeMillis()),
                            mechanizedIdUser.get_id(),
                            mechanizedIdUser.get_id());

            return Response.ok()
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(testInstance.toString())
                    .build();
        } catch (Exception e) {
            Utilities.printStackTrace(e, LogLevel.ERROR);
            return ResponseUtility.Build.internalServerError();
        }
    }

    @Override
    public Response createByProcessDefinitionKey(
            String processDefinitionKey,
            int version,
            String authorization,
            TestInstanceCreateRequest request) {
        try {
            // Check if a user associated with the mechanizedId used in the authorization header exists in
            // the database.
            User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
            if (mechanizedIdUser == null) {
                String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
                if (decodedAuth == null) {
                    return ResponseUtility.Build.badRequestWithMessage(
                            String.format("Unable to decode authorization header: %s", authorization));
                }
                String error =
                        String.format(
                                "%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
                return ResponseUtility.Build.unauthorizedWithMessage(error);
            }

            // Check if the String correctly parses as an ObjectId.
            if (Strings.isNullOrEmpty(processDefinitionKey)) {
                return ResponseUtility.Build.badRequestWithMessage("The processDefinitionKey is required.");
            }

            // Find the testDefinition
            TestDefinition testDefinition =
                    testDefinitionRepository.findByProcessDefinitionKey(processDefinitionKey).orElse(null);
            if (testDefinition == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with processDefinitionKey, %s, was not found.",
                                processDefinitionKey));
            }

            Group testDefGroup = Utilities.resolveOptional(groupRepository.findById(testDefinition.getGroupId().toString()));
            if (testDefGroup == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Can not find test definition's group, id: %s", testDefinition.getGroupId().toString()));
            }
            // if not otf email and is not authorized
//            if (PermissionChecker.hasReadPermission(mechanizedIdUser, testDefGroup, groupRepository)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have read access to test definition in group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
//            if (PermissionChecker.hasWritePermission(mechanizedIdUser, testDefGroup)) {
//                return ResponseUtility.Build.unauthorizedWithMessage(
//                        String.format(
//                                "MechanizedId, %s, does not have write access to the group with name, %s",
//                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
//            }
            if (PermissionChecker.hasPermissionTo(mechanizedIdUser, testDefGroup,
                    Arrays.asList(UserPermission.Permission.READ,UserPermission.Permission.WRITE),groupRepository))
            {
                return ResponseUtility.Build.unauthorizedWithMessage(
                        String.format(
                                "MechanizedId, %s, does not have access (read/write) to the group with name, %s",
                                mechanizedIdUser.getEmail(), testDefGroup.getGroupName()));
            }
            // Get the latest version of the test definition to link it with the test instance
            BpmnInstance bpmnInstance = findBpmnInstance(testDefinition, version, false);
            if (bpmnInstance == null) {
                return ResponseUtility.Build.notFoundWithMessage(
                        String.format(
                                "Test definition with id, %s, does not have any versions associated with it.",
                                testDefinition.get_id().toString()));
            }

            TestInstance testInstance =
                    new TestInstance(
                            new ObjectId(),
                            request.getTestInstanceName(),
                            request.getTestInstanceDescription(),
                            testDefinition.getGroupId(),
                            testDefinition.get_id(),
                            bpmnInstance.getProcessDefinitionId(),
                            request.isUseLatestTestDefinition(),
                            false,
                            request.isSimulationMode(),
                            request.getMaxExecutionTimeInMillis(),
                            request.getPfloInput(),
                            new HashMap<>(),
                            request.getSimulationVthInput(),
                            request.getTestData(),
                            request.getVthInput(),
                            new Date(System.currentTimeMillis()),
                            new Date(System.currentTimeMillis()),
                            mechanizedIdUser.get_id(),
                            mechanizedIdUser.get_id());

            return Response.ok()
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(testInstance.toString())
                    .build();
        } catch (Exception e) {
            Utilities.printStackTrace(e, LogLevel.ERROR);
            return ResponseUtility.Build.internalServerError();
        }
    }

    @Override
    public Response findById(String testInstanceId, String authorization) {
        // Check if a user associated with the mechanizedId used in the authorization header exists in
        // the database.
        User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
        if (mechanizedIdUser == null) {
            String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
            if (decodedAuth == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Unable to decode authorization header: %s", authorization));
            }
            String error =
                    String.format("%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
            return ResponseUtility.Build.unauthorizedWithMessage(error);
        }

        // Check if the testInstanceId is a valid BSON ObjectI, otherwise return a bad request
        // response.
        if (!Utilities.isObjectIdValid(testInstanceId)) {
            String error =
                    String.format(
                            "%sThe testInstanceId, %s, is not a valid ObjectId (BSON).",
                            logPrefix, testInstanceId);
            return ResponseUtility.Build.badRequestWithMessage(error);
        }

        // Create an ObjectId now that we know the provided String was valid.
        ObjectId oiTestInstanceId = new ObjectId(testInstanceId);
        // Check if the testInstance exists, otherwise return a not found response.
        TestInstance testInstance = Generic.findByIdGeneric(testInstanceRepository, oiTestInstanceId);
        if (testInstance == null) {
            String error =
                    String.format(
                            "%sThe testInstance with _id, %s, was not found.", logPrefix, testInstanceId);
            return ResponseUtility.Build.notFoundWithMessage(error);
        }

        Group testInstanceGroup = Utilities.resolveOptional(groupRepository.findById(testInstance.getGroupId().toString()));
        if (testInstanceGroup == null) {
            return ResponseUtility.Build.badRequestWithMessage(
                    String.format("Can not find test instance's group, group name :%s", testInstance.get_id().toString()));
        }
        if (!PermissionChecker.hasPermissionTo(mechanizedIdUser,testInstanceGroup,UserPermission.Permission.READ,groupRepository)) {
            return ResponseUtility.Build.unauthorizedWithMessage(
                    String.format(
                            "User %s does not have read access to test instance group, group name: %s.",
                            mechanizedIdUser.getEmail(), testInstanceGroup.getGroupName()));
        }
        return Response.ok(testInstance.toString(), MediaType.APPLICATION_JSON_TYPE).build();
    }

    @Override
    public Response findByProcessDefinitionKey(String processDefinitionKey, String authorization) {
        // Check if a user associated with the mechanizedId used in the authorization header exists in
        // the database.
        User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
        if (mechanizedIdUser == null) {
            String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
            if (decodedAuth == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Unable to decode authorization header: %s", authorization));
            }
            String error =
                    String.format("%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
            return ResponseUtility.Build.unauthorizedWithMessage(error);
        }

        Optional<TestDefinition> optionalTestDefinition =
                testDefinitionRepository.findByProcessDefinitionKey(processDefinitionKey);
        TestDefinition testDefinition = optionalTestDefinition.orElse(null);
        if (testDefinition == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format(
                            "Cannot find test instance because a test"
                                    + " definition with the process definition key (%s) does not exist.",
                            processDefinitionKey));
        }

        List<TestInstance> testInstances =
                testInstanceRepository.findAllByTestDefinitionId(testDefinition.get_id());
        if (testInstances.isEmpty()) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format(
                            "No test instances found with process " + "definition key (%s).",
                            processDefinitionKey));
        }

        List<TestInstance> result = new ArrayList<>();
        for (TestInstance testInstance : testInstances) {
            Group testInstanceGroup = Utilities.resolveOptional(groupRepository.findById(testInstance.getGroupId().toString()));
            if (testInstanceGroup != null && PermissionChecker.hasPermissionTo(mechanizedIdUser,testInstanceGroup,UserPermission.Permission.READ,groupRepository)) {
                result.add(testInstance);
            }
        }

        return Response.ok(result.toString()).build();
    }

    @Override
    public Response findByProcessDefinitionKeyAndVersion(
            String processDefinitionKey, String version, String authorization) {
        // Check if a user associated with the mechanizedId used in the authorization header exists in
        // the database.
        User mechanizedIdUser = Utilities.findUserByAuthHeader(authorization, userRepository);
        if (mechanizedIdUser == null) {
            String[] decodedAuth = Utilities.decodeBase64AuthorizationHeader(authorization);
            if (decodedAuth == null) {
                return ResponseUtility.Build.badRequestWithMessage(
                        String.format("Unable to decode authorization header: %s", authorization));
            }
            String error =
                    String.format("%sMechanizedId is not onboarded with OTF. %s.", logPrefix, decodedAuth[0]);
            return ResponseUtility.Build.unauthorizedWithMessage(error);
        }

        Optional<TestDefinition> optionalTestDefinition =
                testDefinitionRepository.findByProcessDefinitionKey(processDefinitionKey);
        TestDefinition testDefinition = optionalTestDefinition.orElse(null);

        if (testDefinition == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format(
                            "Cannot find test instance because a test"
                                    + " definition with the process definition key (%s) does not exist.",
                            processDefinitionKey));
        }

        int iVersion;
        try {
            iVersion = Integer.parseInt(version);
        } catch (NumberFormatException nfe) {
            return Utilities.Http.BuildResponse.badRequestWithMessage("Version must be a valid integer.");
        }

        BpmnInstance bpmnInstance =
                testDefinition.getBpmnInstances().stream()
                        .filter(_bpmnInstance -> _bpmnInstance.getVersion() == iVersion)
                        .findAny()
                        .orElse(null);

        if (bpmnInstance == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format("Cannot find any test instances using " + "version %s.", version));
        }

        List<TestInstance> testInstances =
                testInstanceRepository.findAllByTestDefinitionIdAndPDId(
                        testDefinition.get_id(), bpmnInstance.getProcessDefinitionId());

        if (testInstances.isEmpty()) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format(
                            "No test instances found with process " + "definition key (%s).",
                            processDefinitionKey));
        }

        List<TestInstance> result = new ArrayList<>();
        for (TestInstance testInstance : testInstances) {
            Group testInstanceGroup = Utilities.resolveOptional(groupRepository.findById(testInstance.getGroupId().toString()));
            if (testInstanceGroup != null && PermissionChecker.hasPermissionTo(mechanizedIdUser,testInstanceGroup,UserPermission.Permission.READ,groupRepository)) {
                result.add(testInstance);
            }
        }

        return Response.ok(result.toString()).build();
    }

    private boolean isOtfMechanizedIdentifier(String email) {
        return email.equalsIgnoreCase(System.getenv("AAF_ID"));
    }

    private BpmnInstance findBpmnInstance(TestDefinition testDefinition, int version, boolean latest)
            throws Exception {
        BpmnInstance bpmnInstance = null;
        int maxVersion = Integer.MIN_VALUE;
        // Check if the version exists
        for (BpmnInstance bi : testDefinition.getBpmnInstances()) {
            // If this field is null or empty, it means the bpmn hasn't been deployed, or there was a
            // creation error on the Test Definition page (UI). Skip the field so the user isn't allowed
            // to create a test instance based off this bpmn instance.
            if (Strings.isNullOrEmpty(bi.getProcessDefinitionId())) {
                continue;
            }

            // Split the processDefinitionId based on it's format:
            // {processDefinitionKey}:{version}:{processDefinitionId}.
            String processDefinitionId = bi.getProcessDefinitionId();
            String[] processDefinitionIdSplit = processDefinitionId.split(":");
            if (processDefinitionIdSplit.length != 3) {
                throw new Exception(
                        String.format(
                                "testDefinition[%s].bpmnInstances.processDefinitionId[%s] is invalid.",
                                testDefinition.get_id().toString(), bi.getProcessDefinitionId()));
            }

            String sVersion = processDefinitionIdSplit[1];
            int currentVersion = Integer.parseInt(sVersion);
            if (latest && currentVersion > maxVersion) {
                bpmnInstance = bi;
            } else if (currentVersion == version) {
                bpmnInstance = bi;
                break;
            }
        }

        return bpmnInstance;
    }

//    private boolean isAuthorized(User user, Group group, String permission, GroupRepository groupRepository) {
//        if (isOtfMechanizedIdentifier(user.getEmail())) {
//            return true;
//        }
//        return PermissionChecker.isAuthorized(user, group, permission.toUpperCase(), groupRepository);
//    }
}
/*
 PermissionChecker.hasReadPermission(mechanizedIdUser,testInstanceGroup,groupRepository)

  PermissionChecker.hasPermission(mechanizedIdUser,testInstanceGroup,groupRepository, [READ, WRITE])
  PermissionsMAp = PermissionChecker.Build.hasRead
 */
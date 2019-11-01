/*-
 * ============LICENSE_START=======================================================
 * ONAP - SO
 * ================================================================================
 * Copyright (C) 2017 AT&T Intellectual Property. All rights reserved.
 * ================================================================================
 * Modifications Copyright (c) 2019 Samsung
 * ================================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============LICENSE_END=========================================================
 */

package org.oran.otf.camunda.workflow;

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.exception.WorkflowProcessorException;
import org.oran.otf.camunda.model.ExecutionConstants.ExecutionVariable;
import org.oran.otf.camunda.model.ExecutionConstants.TestResult;
import org.oran.otf.camunda.model.WorkflowResponse;
import org.oran.otf.camunda.service.ProcessEngineAwareService;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.*;
import org.oran.otf.common.model.historic.TestDefinitionHistoric;
import org.oran.otf.common.model.historic.TestInstanceHistoric;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.repository.*;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.database.Generic;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.UserPermission;
import com.mongodb.client.result.UpdateResult;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.bson.types.ObjectId;
import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.variable.VariableMap;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.impl.VariableMapImpl;
import org.oran.otf.common.model.*;
import org.oran.otf.common.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class WorkflowProcessor extends ProcessEngineAwareService {

    private static final String logPrefix = Utility.getLoggerPrefix();
    private static final Logger logger = LoggerFactory.getLogger(WorkflowProcessor.class);

    @Autowired
    GroupRepository groupRepository;
    @Autowired
    TestDefinitionRepository testDefinitionRepository;
    @Autowired
    TestInstanceRepository testInstanceRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TestExecutionRepository testExecutionRepository;
    @Autowired
    MongoTemplate mongoOperation;
    @Autowired
    WorkflowUtility workflowUtility;

    private RuntimeService runtimeService;
    private RepositoryService repositoryService;

    // Note: the business key is used to identify the process in unit tests
    protected static String getBusinessKey(Map<String, Object> inputVariables) {
        return getOrCreate(inputVariables, "otf-business-key");
    }

    protected static Map<String, Object> getInputVariables(VariableMapImpl variableMap) {
        Map<String, Object> inputVariables = new HashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> vMap = (Map<String, Object>) variableMap.get("variables");
        for (Map.Entry<String, Object> entry : vMap.entrySet()) {
            String vName = entry.getKey();
            Object value = entry.getValue();
            @SuppressWarnings("unchecked")
            Map<String, Object> valueMap = (Map<String, Object>) value; // value, type
            inputVariables.put(vName, valueMap.get("value"));
        }
        return inputVariables;
    }

    protected static String getOrCreate(Map<String, Object> inputVariables, String key) {
        String value = Objects.toString(inputVariables.get(key), null);
        if (value == null) {
            value = UUID.randomUUID().toString();
            inputVariables.put(key, value);
        }
        return value;
    }

    private static void buildVariable(
        String key, String value, Map<String, Object> variableValueType) {
        Map<String, Object> host = new HashMap<>();
        host.put("value", value);
        host.put("type", "String");
        variableValueType.put(key, host);
    }

    @EventListener(ApplicationReadyEvent.class)
    private void initialize() {
        if (this.runtimeService == null) {
            this.runtimeService =
                BpmPlatform.getProcessEngineService()
                    .getProcessEngine(OtfCamundaConfiguration.processEngineName)
                    .getRuntimeService();
        }
        if (this.repositoryService == null) {
            this.repositoryService =
                BpmPlatform.getProcessEngineService()
                    .getProcessEngine(OtfCamundaConfiguration.processEngineName)
                    .getRepositoryService();
        }
    }

    public TestExecution processWorkflowRequest(WorkflowRequest request)
        throws WorkflowProcessorException {

        // Check if the test instance exists.
        TestInstance testInstance =
            Generic.findByIdGeneric(testInstanceRepository, request.getTestInstanceId());
        if (testInstance == null) {
            WorkflowResponse response = new WorkflowResponse();
            response.setMessage(
                String.format(
                    "Test instance with identifier %s was not found.",
                    request.getTestInstanceId().toString()));
            response.setMessageCode(404);
            response.setResponse("Unable to start the test instance.");
            TestExecution testExecution = generateTestExecution(request, null, null, null);
            testExecution.setTestResult(TestResult.DOES_NOT_EXIST);
            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
            response.setTestExecution(testExecution);
            throw new WorkflowProcessorException(response);
        }

        // Override the test data and vth input of the instance if the request contains the data.
        Map<String, Object> vthInput =
                request.getVthInput() == null ? testInstance.getVthInput() : request.getVthInput();
        Map<String, Object> testData =
                request.getTestData() == null ? testInstance.getTestData() : request.getTestData();
        Map<String, ParallelFlowInput> plfoInput =
                request.getPfloInput() == null ? testInstance.getPfloInput() : request.getPfloInput();

        testInstance.setVthInput((HashMap<String, Object>) vthInput);
        testInstance.setTestData((HashMap<String, Object>) testData);
        testInstance.setPfloInput((HashMap<String, ParallelFlowInput>) plfoInput);


        // Check if the test definition linked to the test instance is also present.
        TestDefinition testDefinition =
            Generic.findByIdGeneric(testDefinitionRepository, testInstance.getTestDefinitionId());
        if (testDefinition == null) {
            WorkflowResponse response = new WorkflowResponse();
            response.setMessage(
                String.format(
                    "Test definition with identifier %s was not found.",
                    testInstance.getTestDefinitionId().toString()));
            response.setMessageCode(404);
            response.setResponse("Unable to start the test instance.");
            TestExecution testExecution = generateTestExecution(request, testInstance, null, null);
            testExecution.setTestResult(TestResult.DOES_NOT_EXIST);
            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
            response.setTestExecution(testExecution);
            throw new WorkflowProcessorException(response);
        }

        // is using latest defintion, verify that the processDefinitionId within camunda is present in
        // the test definition bpmn instance list
        if (testInstance.isUseLatestTestDefinition()) {
            String processDefinitionId =
                findLatestProcessDefinition(testDefinition.getProcessDefinitionKey());
            boolean isBpmnInstancePresent =
                verifyIdExistsInTestDefinition(testDefinition, processDefinitionId);
            if (isBpmnInstancePresent) {
                testInstance.setProcessDefinitionId(processDefinitionId);
            } else {
                WorkflowResponse response = new WorkflowResponse();
                response.setMessage(
                    String.format(
                        "Latest Test Definition does not exist for key %s.",
                        testDefinition.getProcessDefinitionKey()));
                response.setMessageCode(404);
                response.setResponse("Unable to start the test instance.");
                TestExecution testExecution =
                    generateTestExecution(request, testInstance, testDefinition, null);
                testExecution.setTestResult(TestResult.DOES_NOT_EXIST);
                testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
                response.setTestExecution(testExecution);
                throw new WorkflowProcessorException(response);
            }
        }

        // Check if the entity making the request has permission to run the test instance.
        User executor = Generic.findByIdGeneric(userRepository, request.getExecutorId());
        if (executor == null) {
            WorkflowResponse response = new WorkflowResponse();
            response.setMessage(
                String
                    .format("User with id %s was not found.", request.getExecutorId().toString()));
            response.setMessageCode(404);
            response.setResponse("Unable to start the test instance.");
            TestExecution testExecution =
                generateTestExecution(request, testInstance, testDefinition, null);
            testExecution.setTestResult(TestResult.DOES_NOT_EXIST);
            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
            response.setTestExecution(testExecution);
            throw new WorkflowProcessorException(response);
        }
//        if (!workflowUtility.hasPermission(executor, testInstance)) {
//            WorkflowResponse response = new WorkflowResponse();
//            response.setMessage(
//                String.format(
//                    "The user with email %s does not have permission to execute test instance with id: %s.",
//                    executor.getEmail(), testInstance.get_id().toString()));
//            response.setMessageCode(401);
//            response.setResponse("Unauthorized to execute the test instance.");
//            TestExecution testExecution =
//                generateTestExecution(request, testInstance, testDefinition, executor);
//            testExecution.setTestResult(TestResult.UNAUTHORIZED);
//            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
//            response.setTestExecution(testExecution);
//            throw new WorkflowProcessorException(response);
//        }
        Group testInstanceGroup = groupRepository.findById(testInstance.getGroupId().toString()).orElse(null);
        if(testInstanceGroup == null){
            WorkflowResponse response = new WorkflowResponse();
            response.setMessage(
                    String.format("unable to find test instance group. Group id: %s",testInstance.getGroupId().toString()));
            response.setMessageCode(404);
            response.setResponse("unable to find test instance group");
            TestExecution testExecution = generateTestExecution(request,testInstance,testDefinition,executor);
            testExecution.setTestResult(TestResult.DOES_NOT_EXIST);
            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
            response.setTestExecution(testExecution);
            throw new WorkflowProcessorException(response);
        }
        if (!PermissionChecker.hasPermissionTo(executor,testInstanceGroup, UserPermission.Permission.EXECUTE,groupRepository)){
            WorkflowResponse response = new WorkflowResponse();
            response.setMessage(
                    String.format(
                            "User with email: %s does not have execute permission on test instance group with id: %s",
                            executor.getEmail(),testInstance.getGroupId().toString()));
            response.setMessageCode(401);
            response.setResponse("unauthorized to execute test instance");
            TestExecution testExecution = generateTestExecution(request,testInstance,testDefinition,executor);
            testExecution.setTestResult(TestResult.UNAUTHORIZED);
            testExecution.setTestDetails(generateTestDetailsWithMessage(response.getMessage()));
            response.setTestExecution(testExecution);
            throw new WorkflowProcessorException(response);
        }

        // Generate a testExecution with a historic copy of the test instance, test definition, and the
        // email of the person executing the test.
        TestExecution testExecution =
            generateTestExecution(request, testInstance, testDefinition, executor);

        // Prepare the test details, test result, test execution, and vth input variables for the
        // process instance.
        VariableMap variableMap =
            Variables.createVariables()
                .putValueTyped(
                    ExecutionVariable.TEST_DETAILS,
                    Variables.objectValue(testExecution.getTestDetails()).create())
                .putValueTyped(
                    ExecutionVariable.TEST_RESULT,
                    Variables.objectValue(testExecution.getTestResult()).create())
                .putValueTyped(
                    ExecutionVariable.TEST_RESULT_MESSAGE,
                    Variables.objectValue(testExecution.getTestResultMessage()).create())
                .putValueTyped(ExecutionVariable.VTH_INPUT,
                    Variables.objectValue(vthInput).create())
                .putValueTyped(ExecutionVariable.TEST_DATA,
                    Variables.objectValue(testData).create())
                .putValue(
                    ExecutionVariable.TEST_EXECUTION,
                    Variables.objectValue(testExecution)
                        .serializationDataFormat(Variables.SerializationDataFormats.JAVA)
                        .create())
                .putValue(
                    ExecutionVariable.PFLO_INPUT,
                    Variables.objectValue(plfoInput)
                        .serializationDataFormat(Variables.SerializationDataFormats.JAVA)
                        .create());

        if (testInstance.isUseLatestTestDefinition()) {
            return startProcessByKey(
                testDefinition.getProcessDefinitionKey(), variableMap, testExecution);
        } else {
            return startProcessById(testInstance.getProcessDefinitionId(), variableMap,
                testExecution);
        }
    }

    public TestExecution startProcessByKey(
        String processKey, Map<String, Object> variableMap, TestExecution testExecution) {
        try {
            logger.info(
                "***OTF startProcessInstanceByKey with processKey: {} and variables: {}",
                processKey,
                variableMap);

            // Set the start time as close to the runtime service start function.
            testExecution.setStartTime(new Date(System.currentTimeMillis()));
            testExecutionRepository.insert(testExecution);

            ProcessInstance processInstance =
                runtimeService.startProcessInstanceByKey(
                    processKey, testExecution.getBusinessKey(), variableMap);

            // Update the test execution object with the processInstanceId after the processInstanceId is
            // available.
            testExecution.setProcessInstanceId(processInstance.getProcessInstanceId());
            Query query = new Query();
            //TODO: Update for Azure
            query.addCriteria((Criteria.where("groupId").is(testExecution.getGroupId())));
            query.addCriteria(Criteria.where("_id").is(testExecution.get_id()));
            // Also add businessKey as a criteria because the object won't be found if the business key
            // was somehow modified in the workflow.
            query.addCriteria(Criteria.where("businessKey").is(testExecution.getBusinessKey()));
            Update update = new Update();
            update.set("processInstanceId", processInstance.getProcessInstanceId());
            UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
            // Check the status of the findAndUpdate database, and appropriately handle the errors.
            if (result.getMatchedCount() == 0) {
                throw new TestExecutionException(
                    String.format(
                        "Unable to log the test result because a testExecution associated with _id, %s and businessKey %s, was not found.",
                        testExecution.get_id(), testExecution.getBusinessKey()));
            } else if (result.getModifiedCount() == 0) {
                throw new TestExecutionException(
                    "Unable to persist the testExecution to the database.");
            }

            logger.debug(
                logPrefix
                    + "Process "
                    + processKey
                    + ":"
                    + processInstance.getProcessInstanceId()
                    + " "
                    + (processInstance.isEnded() ? "ENDED" : "RUNNING"));
        } catch (Exception e) {
            WorkflowResponse workflowResponse = new WorkflowResponse();
            workflowResponse.setResponse("Error occurred while executing the process: " + e);
            workflowResponse.setProcessInstanceId(testExecution.getProcessInstanceId());
            workflowResponse.setMessageCode(500);
            workflowResponse.setMessage("Failed to execute test instance: " + e.getMessage());
            testExecution.setTestResult(TestResult.FAILED);
            testExecution
                .setTestDetails(generateTestDetailsWithMessage(workflowResponse.getMessage()));
            workflowResponse.setTestExecution(testExecution);
            throw new WorkflowProcessorException(workflowResponse);
        }

        return testExecution;
    }

    private TestExecution startProcessById(
        String processId, Map<String, Object> variableMap, TestExecution testExecution) {
        try {
            logger.debug(
                "***OTF startProcessInstanceById with processId: {} and variables: {}",
                processId,
                variableMap);

            // Set the start time as close to the runtime service start function.
            testExecution.setStartTime(new Date(System.currentTimeMillis()));
            testExecutionRepository.insert(testExecution);

            ProcessInstance processInstance =
                runtimeService.startProcessInstanceById(
                    processId, testExecution.getBusinessKey(), variableMap);

            // Update the test execution object with the processInstanceId after the processInstanceId is
            // available.
            testExecution.setProcessInstanceId(processInstance.getProcessInstanceId());
            Query query = new Query();
            //TODO: Update for Azure
            query.addCriteria((Criteria.where("groupId").is(testExecution.getGroupId())));
            query.addCriteria(Criteria.where("_id").is(testExecution.get_id()));
            // Also add businessKey as a criteria because the object won't be found if the business key
            // was somehow modified in the workflow.
            query.addCriteria(Criteria.where("businessKey").is(testExecution.getBusinessKey()));
            Update update = new Update();
            update.set("processInstanceId", processInstance.getProcessInstanceId());
            UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
            // Check the status of the findAndUpdate database, and appropriately handle the errors.
            if (result.getMatchedCount() == 0) {
                throw new TestExecutionException(
                    String.format(
                        "Unable to log the test result because a testExecution associated with _id, %s and businessKey %s, was not found.",
                        testExecution.get_id(), testExecution.getBusinessKey()));
            } else if (result.getModifiedCount() == 0) {
                throw new TestExecutionException(
                    "Unable to persist the testExecution to the database.");
            }

            logger.debug(
                logPrefix
                    + "Process "
                    + processInstance.getProcessInstanceId()
                    + ":"
                    + processInstance.getProcessInstanceId()
                    + " "
                    + (processInstance.isEnded() ? "ENDED" : "RUNNING"));
        } catch (Exception e) {
            WorkflowResponse workflowResponse = new WorkflowResponse();
            workflowResponse.setResponse("Error occurred while executing the process: " + e);
            workflowResponse.setProcessInstanceId(testExecution.getProcessInstanceId());
            workflowResponse.setMessageCode(500);
            workflowResponse.setMessage("Failed to execute test instance: " + e.getMessage());
            testExecution.setTestResult(TestResult.FAILED);
            testExecution
                .setTestDetails(generateTestDetailsWithMessage(workflowResponse.getMessage()));
            workflowResponse.setTestExecution(testExecution);
            throw new WorkflowProcessorException(workflowResponse);
        }

        return testExecution;
    }

    private TestExecution generateTestExecution(
        WorkflowRequest request,
        TestInstance testInstance,
        TestDefinition testDefinition,
        User executor) {
        TestExecution testExecution = new TestExecution();
        testExecution.set_id(new ObjectId());
        testExecution.setExecutorId(request.getExecutorId());
        testExecution.setAsync(request.isAsync());
        testExecution.setStartTime(null);
        testExecution.setTestDetails(new HashMap<>());
        testExecution.setTestResult(TestResult.UNKNOWN);
        testExecution.setTestResultMessage("");
        testExecution.setProcessInstanceId(null);
        testExecution.setBusinessKey(UUID.randomUUID().toString());
        testExecution.setTestHeadResults(new ArrayList<>());
        testExecution.setTestInstanceResults(new ArrayList<>());
        if (testInstance != null) {
            testExecution.setGroupId(testInstance.getGroupId());
            TestInstanceHistoric testInstanceHistoric = new TestInstanceHistoric(testInstance);
            testExecution.setHistoricTestInstance(testInstanceHistoric);
        }
        if (testDefinition != null && testInstance != null) {
            TestDefinitionHistoric testDefinitionHistoric =
                new TestDefinitionHistoric(testDefinition, testInstance.getProcessDefinitionId());
            testExecution.setHistoricTestDefinition(testDefinitionHistoric);
        }
        if (executor != null) {
            testExecution.setHistoricEmail(executor.getEmail());
        }
        return testExecution;
    }

    private Map<String, Object> generateTestDetailsWithMessage(String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("message", message);
        return map;
    }

    private String findLatestProcessDefinition(String processDefinitionKey) {
        logger.info("Before find process definition key query.");
        ProcessDefinition definition =
            repositoryService
                .createProcessDefinitionQuery()
                .processDefinitionKey(processDefinitionKey)
                .latestVersion()
                .singleResult();
        logger.info("After find process definition key query.");
        String processDefinitionId = null;
        if (definition != null) {
            processDefinitionId = definition.getId();
        }
        return processDefinitionId;
    }

    private boolean verifyIdExistsInTestDefinition(
        TestDefinition definition, String processDefinitionId) {
        if (processDefinitionId == null || definition == null) {
            return false;
        }

        List<BpmnInstance> bpmnInstances = definition.getBpmnInstances();
        BpmnInstance bpmnInstance =
            bpmnInstances.stream()
                .filter(
                    _bpmnInstance -> {
                        return _bpmnInstance.isDeployed()
                            && _bpmnInstance.getProcessDefinitionId() != null
                            && _bpmnInstance.getProcessDefinitionId().equals(processDefinitionId);
                    })
                .findFirst()
                .orElse(null);
        return bpmnInstance != null;
    }
}

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


package org.oran.otf.camunda.delegate.otf.common;

import org.oran.otf.camunda.delegate.otf.common.runnable.TestHeadCallable;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.*;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.model.local.TestHeadNode;
import org.oran.otf.common.model.local.TestHeadResult;
import org.oran.otf.common.repository.*;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.database.Generic;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.UserPermission;
import com.mongodb.client.result.UpdateResult;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.oran.otf.common.model.*;
import org.oran.otf.common.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class CallTestHeadDelegate implements JavaDelegate {
  private static final Logger logger = LoggerFactory.getLogger(CallTestHeadDelegate.class);

  @Autowired
  private UserRepository userRepository;
  @Autowired
  private GroupRepository groupRepository;
  @Autowired
  private WorkflowUtility utility;
  @Autowired
  private TestDefinitionRepository testDefinitionRepository;
  @Autowired
  private TestHeadRepository testHeadRepository;
  @Autowired
  private TestInstanceRepository testInstanceRepository;
  @Autowired
  private MongoTemplate mongoOperation;

  // Used to retrieve the results from test head runnables.
  List<TestHeadResult> testHeadResults = Collections.synchronizedList(new ArrayList<>());

  @Override
  public void execute(DelegateExecution execution) throws Exception {
    callTestHead(
        execution.getCurrentActivityId(),
        execution.getProcessDefinitionId(),
        execution.getProcessInstanceId(),
        execution.getProcessBusinessKey(),
        execution.getVariables());
  }

  public void callTestHead(
      String currentActivityId,
      String processDefinitionId,
      String processInstanceId,
      String processBusinessKey,
      Map<String, Object> variables)
      throws Exception {
    final String logPrefix = Utility.getLoggerPrefix();
    logger.info(logPrefix + "::execute()");

    // Get vthInput from the Camunda execution variable map.
    List<Map<String, Object>> activityParameters = utility.getVthInput(variables, currentActivityId, logPrefix);

    // Get the current test execution object.
    TestExecution testExecution = utility.getTestExecution(variables, logPrefix);

    // Lookup the test head before making computations in the loop, and before calling the runnable.
    // If the lookup is made inside the runnable, concurrent test head calls would bombard the db.
    TestHead testHead = getTestHead(testExecution, currentActivityId, processDefinitionId);

    WorkflowTask workflowTask = new WorkflowTask(processInstanceId, activityParameters.size(), false);
    ExecutorService pool = workflowTask.getPool();

    // Try to cast each parameter to a Map, and create runnable tasks.
    for (int i = 0; i < activityParameters.size(); i++) {
      Object oTestHeadParameter = activityParameters.get(i);
      Map<?, ?> mTestHeadParameter;
      try {
        mTestHeadParameter = Utility.toMap(oTestHeadParameter);
        verifyOtfTestHead(mTestHeadParameter, testHead, testExecution, currentActivityId);
      } catch (Exception e) {
        // TODO: Make a design decision to either stop the execution, or attempt to convert the
        // other parameters.
        logger.error(
            String.format(
                "Unable to convert test head parameter at vthInput[%s][%d] to a Map.",
                currentActivityId, i));
        continue;
      }

      // Get all the arguments for the runnable.
      Object oHeaders = mTestHeadParameter.get("headers"); // optional
      Object oMethod = mTestHeadParameter.get("method"); // required
      Object oPayload = mTestHeadParameter.get("payload"); // optional
      Object oTimeoutInMillis = mTestHeadParameter.get("timeoutInMillis"); // optional

      // Target typed parameters. Convert all objects to their expected types. Throw exceptions for
      // required parameters, or for parameters that are provided but not of the expected type.
      Map<String, String> headers = new HashMap<>();
      String method = "";
      Map<String, Object> payload = new HashMap<>();
      int timeoutInMillis = 0;

      if (oHeaders != null) {
        try {
          headers = (Map<String, String>) Utility.toMap(oHeaders);
        } catch (Exception e) {
          logger.error(
              String.format(
                  "Unable to convert test head parameter at vthInput[%s][%d][headers] to a Map.",
                  currentActivityId, i));
        }
      }

      if (oMethod == null) {
        throw new TestExecutionException(
            String.format(
                "vthInput[%s][%d][method] is a required parameter.", currentActivityId, i));
      } else {
        try {
          method = (String) oMethod;
        } catch (ClassCastException cce) {
          throw new TestExecutionException(
              String.format(
                  "Unable to read vthInput[%s][%d][method] as primitive type String.",
                  processInstanceId, i));
        }
      }

      if (oPayload != null) {
        try {
          payload = (Map<String, Object>) Utility.toMap(oPayload);
        } catch (Exception e) {
          logger.error(
              String.format(
                  "Unable to convert test head parameter at vthInput[%s][%d][payload] to a Map.",
                  currentActivityId, i));
        }
      }

      if (oTimeoutInMillis != null) {
        try {
          timeoutInMillis = (int) oTimeoutInMillis;
        } catch (ClassCastException cce) {
          throw new TestExecutionException(
              String.format(
                  "Unable to read vthInput[%s][%d][timeoutInMillis] as primitive type int.",
                  currentActivityId, i));
        }
      }

//      logger.info("{}(BEFORE) PRINTING THREAD INFORMATION", logPrefix);
//      WorkflowTask.printThreadInformation();
//      logger.info("{}(BEFORE) PRINTING WORKFLOW TASKS", logPrefix);
//      WorkflowTask.printWorkflowTaskResources();
      TestHeadCallable callable =
          new TestHeadCallable(
              timeoutInMillis,
              method,
              headers,
              payload,
              testHead,
              currentActivityId,
              testExecution,
              mongoOperation);

      // Submit the test head call to the executor service.
      workflowTask.getFutures().add(pool.submit(callable));
    }

    // Prevent new tasks from being submitted, and allow running tasks to finish.
    pool.shutdown();

    int numResults = 0;
    while (!pool.isTerminated()) {
      try {
        pool.awaitTermination(1, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        workflowTask.shutdown(true);
        throw e;
      }
    }

    workflowTask.shutdown(false);

//    logger.info("{}(AFTER) PRINTING THREAD INFORMATION", logPrefix);
//    WorkflowTask.printThreadInformation();
//    logger.info("{}(AFTER) PRINTING WORKFLOW TASKS", logPrefix);
//    WorkflowTask.printWorkflowTaskResources();
  }

  private void saveTestHeadResults(String businessKey, String groupId) {
    Query query = new Query();
    //TODO: Update needs to be changed to work with Azure
    query.addCriteria(Criteria.where("groupId").is(groupId));
    query.addCriteria(Criteria.where("businessKey").is(businessKey));
    Update update = new Update();
    update.set("testHeadResults", testHeadResults);
    UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
    // Check the status of the findAndUpdate database, and appropriately handle the errors.
    if (result.getMatchedCount() == 0) {
      throw new TestExecutionException(
          String.format(
              "Unable to log the test result because a testExecution associated with businessKey, %s, was not found.",
              businessKey));
    } else if (result.getModifiedCount() == 0) {
      throw new TestExecutionException("Unable to persist the testExecution to the database.");
    }
  }

  private TestHead getTestHead(
      TestExecution testExecution, String currentActivityId, String processDefinitionId) {
    List<BpmnInstance> bpmnInstances = testExecution.getHistoricTestDefinition().getBpmnInstances();
    BpmnInstance bpmnInstance =
        bpmnInstances.stream()
            .filter(
                _bpmnInstance ->
                    _bpmnInstance.getProcessDefinitionId().equalsIgnoreCase(processDefinitionId))
            .findFirst()
            .orElse(null);

    if (bpmnInstance == null) {
      throw new TestExecutionException(
          String.format(
              "Error looking BpmnInstance with processDefinitionId %s.", processDefinitionId));
    }

    List<TestHeadNode> testHeads = bpmnInstance.getTestHeads();
    TestHeadNode testHeadNode =
        testHeads.stream()
            .filter(testHead -> testHead.getBpmnVthTaskId().equals(currentActivityId))
            .findAny()
            .orElse(null);

    if (testHeadNode == null) {
      throw new TestExecutionException(
          String.format(
              "No test head associated with the currentActivityId %s.", currentActivityId));
    }

    TestHead testHead = Generic.findByIdGeneric(testHeadRepository, testHeadNode.getTestHeadId());
    if (testHead == null) {
      throw new TestExecutionException(
          String.format(
              "The test head with id, %s, was not found in the database.",
              testHeadNode.getTestHeadId()));
    }
    User testExecUser = userRepository.findById(testExecution.getExecutorId().toString()).orElse(null);
    Group testheadGroup =  groupRepository.findById(testHead.getGroupId().toString()).orElse(null);
    if(testExecUser == null){
      throw new TestExecutionException(
              String.format("Can not find user, user id: %s",testExecution.getExecutorId().toString()));
    }
    if(testheadGroup == null){
      throw new TestExecutionException(
              String.format("Can not find test head group, group id: %s",testHead.getGroupId().toString())
      );
    }

    if( (testHead.isPublic() != null && !testHead.isPublic()) &&
            !PermissionChecker.hasPermissionTo(testExecUser,testheadGroup,UserPermission.Permission.EXECUTE,groupRepository)){
      throw new TestExecutionException(
              String.format(
                      "User(%s) does not have permission to in testHead Group(%s)",
                      testExecUser.get_id().toString(),testheadGroup.get_id().toString()
              ));
    }
    return testHead;
  }

  private void verifyOtfTestHead(Map activityParams, TestHead testHead, TestExecution execution, String currentActivityId){
    String testHeadName = testHead.getTestHeadName().toLowerCase();
    switch(testHeadName) {
      case "robot":
        try {
          TestInstance testInstance = Generic.findByIdGeneric(testInstanceRepository, execution.getHistoricTestInstance().get_id());
          Map<String, Object> internalTestDataByActivity = (Map<String, Object>) testInstance.getInternalTestData().get(currentActivityId);
          String robotFileId = (String) internalTestDataByActivity.get("robotFileId");
          Map<String, Object> testData = new HashMap<>();
          Map<String, Object> vthInput = new HashMap<>();
          testData.put("robotFileId", robotFileId);
          vthInput.put("testData", testData);
          Map<String, Object> payload = (Map<String, Object>) activityParams.get("payload");
          payload.put("vthInput", vthInput);
        }
        catch (Exception e){
          throw new TestExecutionException(
                  String.format(
                          "Robot test head needs a robot file id: %s.", e.getMessage()));
        }
        break;
      default:
        break;
    }
  }
}

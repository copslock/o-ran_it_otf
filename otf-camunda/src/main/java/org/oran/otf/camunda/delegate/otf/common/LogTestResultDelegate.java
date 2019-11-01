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

import com.mongodb.client.result.UpdateResult;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.utility.Utility;

import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class LogTestResultDelegate implements JavaDelegate {

  private static Logger logger = LoggerFactory.getLogger(LogTestResultDelegate.class);

  @Autowired
  private TestExecutionRepository testExecutionRepository;
  @Autowired
  private MongoTemplate mongoOperation;
  @Autowired
  private WorkflowUtility utility;

  @Override
  public void execute(DelegateExecution execution) throws Exception {
    logger.info("[LogTestResult] Starting to log test result.");
    final String logPrefix = Utility.getLoggerPrefix();
    // Get the current test execution object.
    TestExecution testExecution = utility.getTestExecution(execution.getVariables(), logPrefix);

    // Set the end time right after retrieving the execution. This will not include the save time
    // to the database.
    testExecution.setEndTime(new Date(System.currentTimeMillis()));

    // Set the processInstanceId because the user may have modified it through a script task.
    testExecution.setProcessInstanceId(execution.getProcessInstanceId());

    // Get the test result from the execution.
    String testResult = utility.getTestResult(execution.getVariables(), logPrefix).toUpperCase();
    if(testResult.equalsIgnoreCase(ExecutionConstants.TestResult.WORKFLOW_ERROR)){
      testResult = ExecutionConstants.TestResult.ERROR;
    }
    if(Arrays.asList(ExecutionConstants.getAllTestResultStr()).contains(testResult.toUpperCase()))
      testExecution.setTestResult(testResult.toUpperCase());
    else{
      testExecution.setTestResult(ExecutionConstants.TestResult.OTHER);
    }

    //Get the test result message from the execution
    String testResultMessage = utility.getTestResultMessage(execution.getVariables(), logPrefix);
    testExecution.setTestResultMessage(testResultMessage);

    // Get test details as a String because it can be saved as one of many "JSON" types. Then try
    // to convert it to a generic map.
    Map<String, Object> testDetails = utility.getTestDetails(execution.getVariables(), logPrefix);
    // Save the converted object to the test execution.
    testExecution.setTestDetails(testDetails);


    // Update the Test Execution object to save the result. Find the existing test execution by the
    // processBusinessKey from the delegate execution because it is saved to the database before the
    // user can modify the value.
    Query query = new Query();
    //TODO: Update query needs to be changed for Azure
    query.addCriteria((Criteria.where("groupId").is(testExecution.getGroupId())));
    query.addCriteria(Criteria.where("businessKey").is(execution.getProcessBusinessKey()));
    Update update = new Update();
    update.set("testResult", testExecution.getTestResult());
    update.set("testResultMessage", testExecution.getTestResultMessage());
    update.set("testDetails", testExecution.getTestDetails());
    update.set("endTime", testExecution.getEndTime());
    update.set("processInstanceId", execution.getProcessInstanceId());
    UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
    // Check the status of the findAndUpdate database, and appropriately handle the errors.
    if (result.getMatchedCount() == 0) {
      throw new TestExecutionException(
          String.format(
              "Unable to log the test result because a testExecution associated with businessKey, %s, was not found.",
              execution.getProcessBusinessKey()));
    } else if (result.getModifiedCount() == 0) {
      throw new TestExecutionException("Unable to persist the testExecution to the database.");
    } else {
      logger.info(
          logPrefix + execution.getProcessInstanceId() + ": Saved test result to the database.");
    }
  }
}

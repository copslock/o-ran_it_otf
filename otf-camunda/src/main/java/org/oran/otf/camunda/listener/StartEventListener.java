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


package org.oran.otf.camunda.listener;

import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.utility.Utility;
import com.google.gson.JsonObject;
import com.mongodb.client.result.UpdateResult;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.extension.reactor.bus.CamundaSelector;
import org.camunda.bpm.extension.reactor.spring.listener.ReactorExecutionListener;
import org.camunda.bpm.model.bpmn.instance.StartEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
@CamundaSelector(event = ExecutionListener.EVENTNAME_END)
public class StartEventListener extends ReactorExecutionListener {

  @Autowired
  WorkflowUtility utility;

  @Autowired
  MongoTemplate mongoOperation;

  private static Logger LOGGER = LoggerFactory.getLogger(StartEventListener.class);

  @Override
  public void notify(DelegateExecution execution) {
    if (execution.getBpmnModelElementInstance() instanceof StartEvent) {
      LOGGER.info(execution.getProcessInstanceId() + " has started.");
      //setTestResult(execution, ExecutionConstants.TestResult.STARTED);
    }
  }

  private void onStartEvent(DelegateExecution execution) {
  }

  private void onVthStart(DelegateExecution execution) {
    // Useful for reporting back the exact parameters being sent to the VTH as they can be modified
    // in the workflow
  }

  private void setTestResult(DelegateExecution execution, String result){
    // Get the current test execution object.
    final String logPrefix = Utility.getLoggerPrefix();

    TestExecution testExecution =
            utility.getExecutionVariable(
                    execution.getVariables(), ExecutionConstants.ExecutionVariable.TEST_EXECUTION, TestExecution.class);
    // Perform a null-check to ensure it is available. It's critical to throw an exception if it
    // is not available since the object is essential for results.
    if (testExecution == null) {
      LOGGER.error(logPrefix + "Test execution is null.");
      throw new TestExecutionException("The test execution was not found.");
    }
    execution.setVariable(ExecutionConstants.ExecutionVariable.TEST_RESULT, result);

    testExecution.setTestResult(result);
    testExecution.setProcessInstanceId(execution.getProcessInstanceId());


    Query query = new Query();
    query.addCriteria(Criteria.where("businessKey").is(execution.getProcessBusinessKey()));
    Update update = new Update();
    update.set("testResult", testExecution.getTestResult());
    update.set("processInstanceId", execution.getProcessInstanceId());
    UpdateResult updateResult = mongoOperation.updateFirst(query, update, TestExecution.class);

  }


}

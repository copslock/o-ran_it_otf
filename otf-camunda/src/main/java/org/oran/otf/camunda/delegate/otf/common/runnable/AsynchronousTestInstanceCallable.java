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


package org.oran.otf.camunda.delegate.otf.common.runnable;

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.exception.WorkflowProcessorException;
import org.oran.otf.camunda.service.ProcessEngineAwareService;
import org.oran.otf.camunda.workflow.WorkflowProcessor;
import org.oran.otf.camunda.workflow.WorkflowRequest;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.utility.database.TestExecutionUtility;
import com.mongodb.client.result.UpdateResult;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Callable;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class AsynchronousTestInstanceCallable extends ProcessEngineAwareService
    implements Callable<TestExecution> {

  private static final Logger logger =
      LoggerFactory.getLogger(AsynchronousTestInstanceCallable.class);
  private final TestExecution parentTestExecution;
  private final TestExecutionRepository testExecutionRepository;
  private final WorkflowProcessor processor;
  private final MongoTemplate mongoOperation;

  private final WorkflowRequest request;
  private String processInstanceId;

  public AsynchronousTestInstanceCallable(
      WorkflowRequest request,
      TestExecution parentTestExecution,
      TestExecutionRepository testExecutionRepository,
      WorkflowProcessor processor,
      MongoTemplate mongoOperation) {
    this.request = request;
    this.parentTestExecution = parentTestExecution;

    this.processInstanceId = "";

    this.testExecutionRepository = testExecutionRepository;
    this.processor = processor;
    this.mongoOperation = mongoOperation;
  }

  public AsynchronousTestInstanceCallable(
      WorkflowRequest request,
      TestExecutionRepository testExecutionRepository,
      WorkflowProcessor processor,
      MongoTemplate mongoOperation) {
    this.request = request;
    this.parentTestExecution = null;

    this.processInstanceId = "";

    this.testExecutionRepository = testExecutionRepository;
    this.processor = processor;
    this.mongoOperation = mongoOperation;
  }

  @Override
  public TestExecution call() throws WorkflowProcessorException {
    try {
      TestExecution initialTestExecution = processor.processWorkflowRequest(request);
      this.processInstanceId = initialTestExecution.getProcessInstanceId();

      // Create a timer task that will call the cancellation after the specified time.
      TimerTask abortTestInstanceTask =
          new TimerTask() {
            @Override
            public void run() {
              cancelProcessInstance(processInstanceId);

              // Find the result after the process instance after it has finished.
              TestExecution testExecution =
                  testExecutionRepository
                      .findFirstByProcessInstanceId(processInstanceId)
                      .orElse(null);
              if (testExecution == null) {
                logger.error(
                    String.format(
                        "Process instance with id %s completed, however, a corresponding test execution was not found in the database.",
                        processInstanceId));
              } else {
                testExecution.setTestResult(ExecutionConstants.TestResult.TERMINATED);
                TestExecutionUtility.saveTestResult(
                    mongoOperation, testExecution, testExecution.getTestResult());

                // Saves the testExecution to the parent test execution if this belongs to a "sub"
                // test
                // instance call.
                // updated terminated
                saveToParentTestExecution(testExecution);
              }
            }
          };

      // Start the daemon that waits the max time for a running test instance.
      long maxExecutionTimeInMillis = request.getMaxExecutionTimeInMillis();
      if (maxExecutionTimeInMillis > 0) {
        new Timer(true).schedule(abortTestInstanceTask, maxExecutionTimeInMillis);
      }

      return initialTestExecution;
    } catch (WorkflowProcessorException e) {
      throw e;
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private void saveToParentTestExecution(TestExecution testExecution) {
    if (parentTestExecution == null) {
      return;
    }

    synchronized (parentTestExecution) {
      // Add the testExecution to the parentTestExecution
      parentTestExecution.getTestInstanceResults().add(testExecution);
      Query query = new Query();
      //TODO: Update for Azure
      query.addCriteria((Criteria.where("groupId").is(parentTestExecution.getGroupId())));
      query.addCriteria(Criteria.where("_id").is(parentTestExecution.get_id()));
      // Also add businessKey as a criteria because the object won't be found if the business key
      // was somehow modified in the workflow.
      query.addCriteria(Criteria.where("businessKey").is(parentTestExecution.getBusinessKey()));
      Update update = new Update();
      update.set("testInstanceResults", parentTestExecution.getTestInstanceResults());
      UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
      // Check the status of the findAndUpdate database, and appropriately handle the errors.
      if (result.getMatchedCount() == 0) {
        throw new TestExecutionException(
            String.format(
                "Unable to log the test result because a testExecution associated with _id, %s and businessKey %s, was not found.",
                parentTestExecution.get_id(), parentTestExecution.getBusinessKey()));
      } else if (result.getModifiedCount() == 0) {
        throw new TestExecutionException("Unable to persist the testExecution to the database.");
      }
    }
  }

  private boolean isProcessInstanceEnded(String processInstanceId) {
    try {
      RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();
      ProcessInstance processInstance =
          runtimeService
              .createProcessInstanceQuery()
              .processInstanceId(processInstanceId)
              .singleResult();
      return processInstance == null || processInstance.isEnded();
    } catch (Exception e) {
      logger.error("Exception :", e);
      return true;
    }
  }

  private boolean cancelProcessInstance(String processInstanceId) {
    try {
      RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();
      runtimeService.deleteProcessInstance(
          processInstanceId, "Triggered by user defined max execution time timeout.");
      ProcessInstance processInstance =
          runtimeService
              .createProcessInstanceQuery()
              .processInstanceId(processInstanceId)
              .singleResult();
      return processInstance == null || processInstance.isEnded();
    } catch (Exception e) {
      logger.error("Exception :", e);
      return true;
    }
  }
}

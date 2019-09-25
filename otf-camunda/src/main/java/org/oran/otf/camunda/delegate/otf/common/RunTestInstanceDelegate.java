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

import org.oran.otf.camunda.delegate.otf.common.runnable.SynchronousTestInstanceCallable;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.workflow.WorkflowProcessor;
import org.oran.otf.camunda.workflow.WorkflowRequest;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.utility.Utility;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class RunTestInstanceDelegate implements JavaDelegate {

  private final String logPrefix = Utility.getLoggerPrefix();
  private final Logger logger = LoggerFactory.getLogger(RunTestInstanceDelegate.class);
  // Used to retrieve the results from test head runnables.
  private final List<TestExecution> testExecutions =
      Collections.synchronizedList(new ArrayList<>());

  private @Autowired
  WorkflowUtility utility;
  private @Autowired
  TestExecutionRepository testExecutionRepository;
  private @Autowired
  WorkflowProcessor processor;
  private @Autowired MongoTemplate mongoOperation;

  @Override
  public void execute(DelegateExecution execution) throws Exception {
    runTestInstance(
        execution.getCurrentActivityId(),
        execution.getProcessInstanceId(),
        execution.getVariables());
  }

  public void runTestInstance(
      String currentActivityId, String processInstanceId, Map<String, Object> variables)
      throws Exception {
    @SuppressWarnings("unchecked")

    // Get the current test execution object to pass as an argument to the callable, and for data
    // stored in the historicTestInstance
    TestExecution testExecution = utility.getTestExecution(variables, logPrefix);

    // Get the parallel flow input
    Map<String, ParallelFlowInput> pfloInput =
        (Map<String, ParallelFlowInput>) variables.get("pfloInput");

    if (!pfloInput.containsKey(currentActivityId)) {
      throw new TestExecutionException(
          String.format(
              "%sCould not find activityId %s in pfloInput.", logPrefix, currentActivityId));
    }

    ParallelFlowInput parallelFlowInput = pfloInput.get(currentActivityId);
    List<WorkflowRequest> args = parallelFlowInput.getArgs();
    boolean interruptOnFailure = parallelFlowInput.isInterruptOnFailure();
    int maxFailures = parallelFlowInput.getMaxFailures();
    int threadPoolSize = parallelFlowInput.getThreadPoolSize();

    WorkflowTask workflowTask =
        new WorkflowTask(processInstanceId, threadPoolSize, interruptOnFailure);
    ExecutorService pool = workflowTask.getPool();

//    logger.info("{}(BEFORE) PRINTING THREAD INFORMATION", logPrefix);
//    WorkflowTask.printThreadInformation();
//    logger.info("{}(BEFORE) PRINTING WORKFLOW TASKS", logPrefix);
//    WorkflowTask.printWorkflowTaskResources();

    for (WorkflowRequest request : args) {
      request.setExecutorId(testExecution.getExecutorId());
      // If an inner workflow calls the parent workflow, there is a cyclic dependency. To prevent
      // infinite test instances from being spawned, we need to check for cycles. This is only a top
      // level check, but a more thorough check needs to be implemented after 1906.
      if (request.getTestInstanceId() == testExecution.getHistoricTestInstance().get_id()) {
        // Prevent new tasks from being submitted
        pool.shutdown();
        // Shutdown the thread pool, and cleanup threads.
        workflowTask.shutdown(true);
        break;
      }

      SynchronousTestInstanceCallable synchronousTestInstanceCallable =
          new SynchronousTestInstanceCallable(
              request, testExecution, testExecutionRepository, processor, mongoOperation);
      workflowTask.getFutures().add(pool.submit(synchronousTestInstanceCallable));
    }

    // Prevent new tasks from being submitted, and allow running tasks to finish.
    pool.shutdown();

    // Wait for test instances to finish execution, and check for failures.
    while (!pool.isTerminated()) {
      try {
        // Terminate tasks if the test execution failure limit is reached.
        int numFailures;
        synchronized (testExecution) {
          numFailures = getNumberOfFailures(testExecution.getTestInstanceResults());
        }

        if (numFailures > maxFailures) {
          logger.error(
              String.format(
                  "[PARENT-%s] Shutting down workflow - numFailures: %s, maxFailures: %s.",
                  processInstanceId, numFailures, maxFailures));
          workflowTask.shutdown();
        }

        pool.awaitTermination(1, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        throw e;
      }
    }

    workflowTask.shutdown(false);

//    logger.info("{}(AFTER) PRINTING THREAD INFORMATION", logPrefix);
//    WorkflowTask.printThreadInformation();
//    logger.info("{}(AFTER) PRINTING WORKFLOW TASKS", logPrefix);
//    WorkflowTask.printWorkflowTaskResources();
  }

  // Gets the total number of testExecutions that have failed.
  private int getNumberOfFailures(List<TestExecution> testExecutions) {
    int numFailures = 0;

    for (TestExecution testExecution : testExecutions) {
      if (isTestFailed(testExecution)) {
        numFailures++;
      }
    }

    return numFailures;
  }

  // Checks if the testResult is marked as FAILED or FAILURE.
  private boolean isTestFailed(TestExecution testExecution) {
    String testResult = testExecution.getTestResult();
    logger.debug(
        String.format(
            "[PARENT-%s] Test result for inner execution: %s.",
            testExecution.getProcessInstanceId(), testExecution.getTestResult()));
    return testResult.equalsIgnoreCase(ExecutionConstants.TestResult.FAILED)
//        || testResult.equalsIgnoreCase(TestResult.FAILED)
        || testResult.equalsIgnoreCase(ExecutionConstants.TestResult.TERMINATED);
  }
}

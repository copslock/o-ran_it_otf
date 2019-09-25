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


package org.oran.otf.camunda.workflow.handler;

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.model.ExecutionConstants.TestResult;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.service.impl.DeleteProcessInstanceServiceImpl;
import com.mongodb.client.result.UpdateResult;

import java.util.Date;
import java.util.List;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.impl.incident.IncidentContext;
import org.camunda.bpm.engine.impl.incident.IncidentHandler;
import org.camunda.bpm.engine.runtime.Execution;
import org.camunda.bpm.engine.runtime.Incident;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class ExternalTaskIncidentHandler implements IncidentHandler {

  private static final Logger logger = LoggerFactory.getLogger(ExternalTaskIncidentHandler.class);
  private static final String logPrefix = Utility.getLoggerPrefix();

  @Autowired
  private TestExecutionRepository testExecutionRepository;
  @Autowired
  private MongoTemplate mongoOperation;
  @Autowired
  private DeleteProcessInstanceServiceImpl deleteProcessInstanceService;

  @Override
  public String getIncidentHandlerType() {
    return Incident.EXTERNAL_TASK_HANDLER_TYPE;
  }

  @Override
  public Incident handleIncident(IncidentContext context, String message) {
    //need to get process instance id from executionid (parent process)
    String executionId = context.getExecutionId();
    RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();

    Execution execution = runtimeService.createExecutionQuery().executionId(executionId).singleResult();
    String processInstanceId = execution.getProcessInstanceId();
    TestExecution testExecution =
        testExecutionRepository.findFirstByProcessInstanceId(processInstanceId).orElse(null);

    if (testExecution == null) {
      String error =
          String.format(
              "%sUnable to find testExecution with processInstanceId %s. This process instance will forcefully be terminated to avoid a rogue process.",
              logPrefix, processInstanceId);
      logger.error(error);
      deleteProcessInstanceService.deleteProcessInstanceInternal(processInstanceId, error);
    } else {
      if(!testExecution.getTestResult().equals(TestResult.TERMINATED)){
        updateTestResult(testExecution, TestResult.WORKFLOW_ERROR, message);
      }
      deleteProcessInstanceService.deleteProcessInstanceInternal(processInstanceId, message);

      List<WorkflowTask> workflowTasks =
          WorkflowTask.workflowTasksByExecutionId.getOrDefault(processInstanceId, null);

      if (workflowTasks != null) {
        logger.debug("Forcefully terminating workflow tasks for processInstanceId: " + processInstanceId);
        for (WorkflowTask workflowTask : workflowTasks) {
          workflowTask.shutdown(true);
        }
      }
    }

    return null;
  }

  private void updateTestResult(TestExecution testExecution, String testResult, String testResultMessage) {
    // Set the test result
    testExecution.setTestResult(testResult);
    testExecution.setTestResultMessage(testResultMessage);
    Query query = new Query();
    query.addCriteria(Criteria.where("_id").is(testExecution.get_id()));
    // Also add businessKey as a criteria because the object won't be found if the business key
    // was somehow modified in the workflow.
    query.addCriteria(Criteria.where("businessKey").is(testExecution.getBusinessKey()));
    Update update = new Update();
    update.set("testResult", testExecution.getTestResult());
    update.set("testResultMessage", testExecution.getTestResultMessage());
    update.set("endTime", new Date(System.currentTimeMillis()));
    UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
    // Check the status of the findAndUpdate database, and appropriately handle the errors.
    if (result.getMatchedCount() == 0) {
      throw new TestExecutionException(
          String.format(
              "Unable to log the test result because a testExecution associated with _id, %s and businessKey %s, was not found.",
              testExecution.get_id(), testExecution.getBusinessKey()));
    } else if (result.getModifiedCount() == 0) {
      throw new TestExecutionException("Unable to persist the testExecution to the database.");
    }
  }

  @Override
  public void resolveIncident(IncidentContext context) {
    //    logger.info("incident resolved");
  }

  @Override
  public void deleteIncident(IncidentContext context) {
    //    logger.info("incident deleted");
  }
}

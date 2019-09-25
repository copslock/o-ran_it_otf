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


package org.oran.otf.camunda.service;

import static org.springframework.data.mongodb.core.query.Criteria.where;

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.model.ExecutionConstants.TestResult;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.common.model.TestExecution;

import org.oran.otf.service.impl.DeveloperServiceImpl;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.OptimisticLockingException;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.BulkOperations.BulkMode;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class CamundaShutdown {

  private Logger logger = LoggerFactory.getLogger(DeveloperServiceImpl.class);

  @Autowired
  private MongoTemplate mongoTemplate;

  public CamundaShutdown(){}

  //TODO: delete unused code
  public Set<String> gracefulShutdown(){
    Set<String> processIds = new HashSet<>();

    try {
      if (!WorkflowTask.workflowTasksByExecutionId.isEmpty()) {
        processIds = WorkflowTask.workflowTasksByExecutionId.keySet();
        if (processIds != null) {
          suspendTasks(processIds);
          //1. Update processes running as TERMINATED
          BulkOperations updates = prepareBatchUpdate(processIds);
          updates.execute();

          //3.kill poolthreads
          processIds = this.shutdownAllProcessThreads(processIds);
          //this.shutdownAllProcessThreads(processIds);

          //2.look up process instances and delete the suspeded processes
          processIds = queryProcessInstances(processIds);

        }
      }
    }catch (OptimisticLockingException e){
      //4. Update processes running as TERMINATED
      BulkOperations threadsInterrupted = prepareBatchUpdate(processIds);
      threadsInterrupted.execute();
      logger.info("Optimistic error was caught by graceful shutdown method");
    }
    return processIds;
  }
  private void suspendTasks(Set<String> processIds){
    RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(
        OtfCamundaConfiguration.processEngineName).getRuntimeService();
    for(String id: processIds){
      runtimeService.suspendProcessInstanceById(id);
    }
  }

    private Set<String> queryProcessInstances(Set<String> processIds){
      RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(
          OtfCamundaConfiguration.processEngineName).getRuntimeService();
      for(String id: processIds){
        ProcessInstance instance = runtimeService.createProcessInstanceQuery().processInstanceId(id).singleResult();
        if(instance == null || instance.isEnded()){
          processIds.remove(id);
        }
      }
      List<String> del = new ArrayList<>(processIds);
      runtimeService.deleteProcessInstances(del, "Camunda Shutting down, proccess forcefully terminated", false, false , false);
      return processIds;

    }

  private Set<String> shutdownAllProcessThreads(Set<String> processIds){
    Set<String> terminatedProcesses = new HashSet<>();
    Iterator processes = processIds.iterator();
    //Iterator processes = WorkflowTask.workflowTasksByExecutionId.entrySet().iterator();
    while(processes.hasNext()){
      Object processHolder = processes.next();
      List<WorkflowTask> tasks = WorkflowTask.workflowTasksByExecutionId.get(processHolder.toString());
      //List<WorkflowTask> tasks = WorkflowTask.workflowTasksByExecutionId.get(processes.next());
      if(tasks != null){
        terminatedProcesses.add(processHolder.toString());
        for(WorkflowTask task: tasks){
          task.shutdown(true);
        }
      }

      else{
        //processIds.remove(processes.next());
      }
    }
    return terminatedProcesses;
  }
  private BulkOperations prepareBatchUpdate(Set<String> processIds){
    //Set<String> processInstanceIds = this.runningProcessInstanceIds();
    Iterator<String> ids = processIds.iterator();//processInstanceIds.iterator();
    BulkOperations bulkOperations = mongoTemplate.bulkOps(BulkMode.ORDERED, TestExecution.class);
    while(ids.hasNext()){
      ids.hasNext();
      //Get tasks by processInstanceId
      Update update = new Update().set("testResult", TestResult.TERMINATED).set("testResultMessage", "Camunda application had to shutdown for maintenance, Test execution was TERMINATED");
      bulkOperations.updateOne(Query.query(where("processInstanceId").is(ids.next())), update);
    }
    return bulkOperations;
  }
}

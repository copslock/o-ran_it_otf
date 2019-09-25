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
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.utility.Utility;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.impl.context.Context;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.extension.reactor.bus.CamundaSelector;
import org.camunda.bpm.extension.reactor.spring.listener.ReactorExecutionListener;
import org.camunda.bpm.model.bpmn.instance.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@CamundaSelector(event = ExecutionListener.EVENTNAME_END)
public class TaskEndEventListener extends ReactorExecutionListener {

    @Autowired
    WorkflowUtility utility;

    @Autowired
    MongoTemplate mongoOperation;

    @Autowired
    RuntimeService runtimeService;

    private static Logger LOGGER = LoggerFactory.getLogger(TaskEndEventListener.class);

    @Override
    public void notify(DelegateExecution execution) {
        if(execution.getBpmnModelElementInstance() instanceof Task){
            String processInstanceId = execution.getProcessInstanceId();
            ProcessInstance processInstance;
            try {
                processInstance = checkProcessInstanceStatus(processInstanceId);
            }catch(Exception e){
               throw new TestExecutionException("Error trying to obtain process instance status, error: " + e) ;
            }
            // if process instance not found then terminate the current process
            if(processInstance == null || processInstance.isEnded() || processInstance.isSuspended()){
                String logPrefix = Utility.getLoggerPrefix();

                LOGGER.info(logPrefix + "Process Instance not found. Terminating current job (thread).");
                Thread.currentThread().interrupt();
                throw new TestExecutionException("Terminated Process Instance: " + processInstanceId + ". Process Instance no longer exists, thread has been forcefully interrupted");
            }
        }
    }

    private ProcessInstance checkProcessInstanceStatus(String processInstanceId){
        return Context.getProcessEngineConfiguration().getCommandExecutorTxRequiresNew().execute(new Command<ProcessInstance>() {
            @Override
            public ProcessInstance execute(CommandContext commandContext){
                return runtimeService.createProcessInstanceQuery().processInstanceId(processInstanceId).singleResult();
            }
        });
    }

}

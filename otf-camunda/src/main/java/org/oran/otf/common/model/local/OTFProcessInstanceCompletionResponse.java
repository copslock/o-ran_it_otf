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


package org.oran.otf.common.model.local;

import org.oran.otf.camunda.model.ExecutionConstants;
import org.camunda.bpm.engine.history.*;
import org.camunda.bpm.engine.impl.history.event.HistoricExternalTaskLogEntity;
import org.camunda.bpm.engine.impl.persistence.entity.HistoricJobLogEventEntity;
import org.camunda.bpm.engine.impl.persistence.entity.HistoricVariableInstanceEntity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OTFProcessInstanceCompletionResponse implements Serializable {
    private HistoricProcessInstance historicProcessInstance;
    private List<HistoricActivityInstance> historicActivityInstance;
    private List<HistoricIncident> historicIncident;
    private List<Map<String, Object>> historicJobLog;
    private List<Map<String, Object>> historicExternalTaskLog;
    private List<Map<String, Object>> historicVariableInstance;

    public OTFProcessInstanceCompletionResponse() {
    }


    public HistoricProcessInstance getHistoricProcessInstance() {
        return historicProcessInstance;
    }

    public void setHistoricProcessInstance(HistoricProcessInstance historicProcessInstance) {
        this.historicProcessInstance = historicProcessInstance;
    }

    public List<HistoricActivityInstance> getHistoricActivityInstance() {
        return historicActivityInstance;
    }

    public void setHistoricActivityInstance(List<HistoricActivityInstance> historicActivityInstance) {
        this.historicActivityInstance = historicActivityInstance;
    }

    public List<HistoricIncident> getHistoricIncident() {
        return historicIncident;
    }

    public void setHistoricIncident(List<HistoricIncident> historicIncident) {
        this.historicIncident = historicIncident;
    }

    public List<Map<String, Object>> getHistoricJobLog() {
        return historicJobLog;
    }

    public void setHistoricJobLog(List<HistoricJobLog> historicJobLog) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        for(HistoricJobLog jobLog: historicJobLog){
            HistoricJobLogEventEntity log = (HistoricJobLogEventEntity) jobLog;
            HashMap map = new HashMap();

            map.put("id", log.getId());
            map.put("executionId", log.getExecutionId());
            map.put("activityId", log.getActivityId());
            map.put("eventType", log.getEventType());
            map.put("sequenceCounter", log.getSequenceCounter());
            map.put("retries", log.getJobRetries());
            map.put("jobExceptionMessage", log.getJobExceptionMessage());
            map.put("jobDefinitionType", log.getJobDefinitionType());
            map.put("jobDefinitionConfiguration", log.getJobDefinitionConfiguration());
            map.put("processDefinitionKey", log.getProcessDefinitionKey());
            map.put("state", convertState(log.getState()));

            list.add(map);
        }
        this.historicJobLog = list;
    }

    public List<Map<String, Object>> getHistoricExternalTaskLog() {
        return this.historicExternalTaskLog;
    }

    public void setHistoricExternalTaskLog(List<HistoricExternalTaskLog> historicExternalTaskLog) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        for(HistoricExternalTaskLog externalTaskLog: historicExternalTaskLog){
            HistoricExternalTaskLogEntity log = (HistoricExternalTaskLogEntity) externalTaskLog;
            HashMap map = new HashMap();

            map.put("id", log.getId());
            map.put("executionId", log.getExecutionId());
            map.put("activityId", log.getActivityId());
            map.put("state", convertState(log.getState()));
            map.put("retries", log.getRetries());
            map.put("processDefinitionKey", log.getProcessDefinitionKey());
            map.put("errorMessage", log.getErrorMessage());
            try {
                map.put("errorDetails", log.getErrorDetails());
            }
            catch (Exception e){}
            map.put("workerId", log.getWorkerId());
            map.put("topic", log.getTopicName());
            list.add(map);
        }
        this.historicExternalTaskLog = list;
    }

    public List<Map<String, Object>> getHistoricVariableInstance() {
        return historicVariableInstance;
    }

    public void setHistoricVariableInstance(List<HistoricVariableInstance> historicVariableInstance) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        for(HistoricVariableInstance variableInstanceEntity: historicVariableInstance){
            HistoricVariableInstanceEntity variable = (HistoricVariableInstanceEntity) variableInstanceEntity;
            HashMap map = new HashMap();
            if (variable.getVariableName().equalsIgnoreCase(ExecutionConstants.ExecutionVariable.TEST_EXECUTION)){
                continue;
            }
            map.put("id", variable.getId());
            map.put("executionId", variable.getExecutionId());
            map.put("processDefinitionKey", variable.getProcessDefinitionKey());
            map.put("taskId", variable.getTaskId());
            map.put("eventType", variable.getVariableName());
            map.put("errorMessage", variable.getErrorMessage());
            map.put("state", variable.getState());
            map.put("variableName", variable.getVariableName());
            map.put("type",  variable.getTypedValue().getType());
            map.put("value",  variable.getTypedValue().getValue());
            map.put("persistentState", variable.getPersistentState());

            list.add(map);
        }
        this.historicVariableInstance = list;
    }

    private String convertState(int state){
        switch (state){
            case 0 :
                return "CREATED";
            case 1 :
                return "FAILED";
            case 2 :
                return "SUCCESSFUL";
            case 3 :
                return "DELETED";
            default:
                return "UNKNOWN";
        }
    }

}

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


package org.oran.otf.service.impl;

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.common.model.local.OTFProcessInstanceCompletionResponse;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.ProcessInstanceCompletionService;
import java.util.List;
import javax.ws.rs.core.Response;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.ManagementService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.history.*;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ProcessInstanceCompletionServiceImpl implements ProcessInstanceCompletionService {

    RuntimeService runtimeService;

    ManagementService managementService;

    HistoryService historyService;



    private ProcessInstanceCompletionServiceImpl() {
        // prohibit instantiation
    }

    @EventListener(ApplicationReadyEvent.class)
    private void initialize(){
        if(this.runtimeService == null){
            this.runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();
        }
        if(this.managementService == null){
            this.managementService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getManagementService();
        }
        if(this.historyService == null){
            this.historyService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getHistoryService();
        }

    }

    @Override
    public Response isProcessInstanceComplete(String processInstanceId) {

        HistoricProcessInstance historicProcessInstance = historyService
                .createHistoricProcessInstanceQuery().processInstanceId(processInstanceId).singleResult();

        List<HistoricActivityInstance> historicActivityInstance = historyService
                .createHistoricActivityInstanceQuery().processInstanceId(processInstanceId).list();

        List<HistoricIncident> historicIncident =
                historyService.createHistoricIncidentQuery().processInstanceId(processInstanceId).list();

        List<HistoricJobLog> historicJobLog =
                historyService.createHistoricJobLogQuery().processInstanceId(processInstanceId).list();

        List<HistoricExternalTaskLog> historicExternalTaskLog =
                historyService.createHistoricExternalTaskLogQuery().processInstanceId(processInstanceId).list();

        List<HistoricVariableInstance> historicVariableInstance =
                historyService.createHistoricVariableInstanceQuery().processInstanceId(processInstanceId).list();



        OTFProcessInstanceCompletionResponse response = new OTFProcessInstanceCompletionResponse();
        response.setHistoricProcessInstance(historicProcessInstance);
        response.setHistoricActivityInstance(historicActivityInstance);
        response.setHistoricIncident(historicIncident);
        response.setHistoricJobLog(historicJobLog);
        response.setHistoricExternalTaskLog(historicExternalTaskLog);
        response.setHistoricVariableInstance(historicVariableInstance);


        return ResponseUtility.Build.okRequestWithObject(response);

        //		Boolean done = runtimeService
//			.createProcessInstanceQuery()
//			.processInstanceId(processInstanceId)
//			.singleResult() == null;
//
//		if(done) {
//			return Response.ok(new ProcessInstanceCompletionResponse("Completed", "Process Instance Completed Execution")).build();
//		}
//
//
//		Incident incident = runtimeService.createIncidentQuery().processInstanceId(processInstanceId).singleResult();
//		if(incident != null && incident.getIncidentType().equals("failedJob")) {
//			String errorMessage = incident.getIncidentMessage();
//			return Response.ok(new ProcessInstanceCompletionResponse("Failed", errorMessage)).build();
//		}
//
//
//		else {
//			return Response.ok(new ProcessInstanceCompletionResponse("In Progress", "Process Instance is active")).build();
//		}
    }
}

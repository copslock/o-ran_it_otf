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
import org.oran.otf.common.model.TestDefinition;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.repository.TestDefinitionRepository;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.DeleteTestDefinitionService;
import java.util.List;
import java.util.Optional;
import javax.ws.rs.core.Response;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RepositoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class DeleteTestDefinitionServiceImpl implements DeleteTestDefinitionService {


    private RepositoryService repositoryService;

    @Autowired
    private TestDefinitionRepository testDefinitionRepository;

    @EventListener(ApplicationReadyEvent.class)
    private void initialize(){
        if(this.repositoryService == null){
            this.repositoryService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRepositoryService();
        }
    }

    // delete a single version by deploymentId
    @Override
    public Response deleteTestStrategyByDeploymentId(String deploymentId) {
        try {
            repositoryService.deleteDeployment(deploymentId, true);
            return ResponseUtility.Build.okRequest();
        } catch (Exception e) {
            return ResponseUtility.Build.badRequestWithMessage(e.getMessage());
        }
    }


    // delete all deployment versions given test definition
    @Override
    public Response deleteTestStrategyByTestDefinitionId(String testDefinitionId) {
        Optional<TestDefinition> testDefinitionQuery =
                testDefinitionRepository.findById(testDefinitionId);
        if (!testDefinitionQuery.isPresent()) {
            return Response.status(404).build();
        }
        TestDefinition testDefinition = testDefinitionQuery.get();

        List<BpmnInstance> bpmnInstances = testDefinition.getBpmnInstances();
        // List<Integer> indices = new ArrayList<Integer>();
        for (int i = 0; i < bpmnInstances.size(); i++) {
            try {
                repositoryService.deleteDeployment(bpmnInstances.get(i).getDeploymentId(), true);
                // indices.add(i);
            } catch (Exception e) {

            }
        }

        // for(int i = indices.size()-1; i >=0; i++) {
        // bpmnInstances.remove(i);
        // }
        // testDefinition.setBpmnInstances(new ArrayList<BpmnInstance>());
        // testDefinitionRepository.save(testDefinition);
        return ResponseUtility.Build.okRequest();


    }


    // delete all deployments
//    public Response deleteAllTestStrategies() {
////         create a database to retrieve all process definitions
//        List<ProcessDefinition> processDefinitions = repositoryService.createProcessDefinitionQuery()
//                .orderByProcessDefinitionVersion().asc().list();
//
//        final int sizeBefore = processDefinitions.size();
//
//        // delete each deployment
//        processDefinitions.forEach(processDefinition -> {
//            repositoryService.deleteDeployment(processDefinition.getDeploymentId(), true);
//        });
//
//        final int sizeAfter = processDefinitions.size();
//
//        Map<String, Object> response = new HashMap<String, Object>();
//        if (sizeBefore - sizeAfter == 0)
//            response.put("numDeletions", sizeBefore);
//        else
//            response.put("numDeletions", sizeBefore - sizeAfter);
//
//        return ResponseUtility.Build.okRequestWithObject(response);
//    }
}

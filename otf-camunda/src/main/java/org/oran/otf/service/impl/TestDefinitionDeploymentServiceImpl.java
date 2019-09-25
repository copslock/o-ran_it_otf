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
import org.oran.otf.common.model.local.OTFDeploymentResponse;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.TestDefinitionDeploymentService;
import java.io.InputStream;
import java.util.List;
import java.util.zip.ZipInputStream;
import javax.ws.rs.core.Response;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.impl.persistence.entity.DeploymentEntity;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class TestDefinitionDeploymentServiceImpl implements TestDefinitionDeploymentService {

    private static Logger logger = LoggerFactory.getLogger(TestDefinitionDeploymentServiceImpl.class);


    private RepositoryService repositoryService;

    private TestDefinitionDeploymentServiceImpl() {
        // prohibit instantiation
    }

    @EventListener(ApplicationReadyEvent.class)
    private void initialize(){
        if(this.repositoryService == null){
            this.repositoryService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRepositoryService();
        }
    }

    public Response deployTestStrategyWithResources(InputStream bpmn, InputStream resourcesZip) {

        if (bpmn == null) {
            logger.error("no bpmn file provided with name 'bpmn' in multipart form");
            return ResponseUtility.Build.badRequestWithMessage("No bpmn file provided with name 'bpmn' in multipart form");
        }
        DeploymentEntity deployment = null;
        try {
            InputStream processDefinitionStream = bpmn;
            BpmnModelInstance bpmnModelInstance = null;
            try {
                bpmnModelInstance = Bpmn.readModelFromStream(processDefinitionStream);
                Bpmn.validateModel(bpmnModelInstance);
            }
            catch(Exception e){
                e.printStackTrace();
                return ResponseUtility.Build.badRequestWithMessage("Unable to deploy BPMN: " + e.getMessage());
            }
            String namespace = bpmnModelInstance.getDefinitions().getDomElement().getNamespaceURI();
            List<DomElement> bpmnProcess =
                    bpmnModelInstance.getDocument().getElementsByNameNs(namespace, "process");
            if (bpmnProcess.size() != 1) {
                logger.info("Invalid number of bpmn process tags");
                return ResponseUtility.Build.internalServerErrorWithMessage("Invalid number of bpmn process tags");
            } else {
                String processDefinitionKey = bpmnProcess.get(0).getAttribute("id");
                if (resourcesZip == null) {
                    deployment = (DeploymentEntity) repositoryService.createDeployment()
                            .addModelInstance(processDefinitionKey + ".bpmn", bpmnModelInstance).deploy();
                } else {
                    ZipInputStream zis = new ZipInputStream(resourcesZip);

                    deployment = (DeploymentEntity) repositoryService.createDeployment()
                            .addModelInstance(processDefinitionKey + ".bpmn", bpmnModelInstance)
                            .addZipInputStream(zis).deploy();
                }
            }
        } catch (Exception e) {
            logger.info("Error: Creating Deployment: " + e.getMessage());
            return ResponseUtility.Build.internalServerErrorWithMessage("Error: Creating Deployment: " + e.getMessage());
        }
        return Response.ok(generateResponseFromDeployment(deployment)).build();
    }

    @Override
    public Response isProcessDefinitionDeployed(String processDefinitionKey) {
        try {
            ProcessDefinition definition =
                    repositoryService
                            .createProcessDefinitionQuery()
                            .processDefinitionKey(processDefinitionKey)
                            .latestVersion()
                            .singleResult();
            if (definition != null) {
                return ResponseUtility.Build.okRequest();
            }
            return ResponseUtility.Build.notFound();
        }
        catch (Exception e){
            return ResponseUtility.Build.internalServerErrorWithMessage(e.getMessage());
        }
    }

    private OTFDeploymentResponse generateResponseFromDeployment(DeploymentEntity deployment) {
        if (deployment == null) {
            return new OTFDeploymentResponse(null, null, null, -1);
        }
        String deploymentId = deployment.getId();
        String id = deployment.getDeployedProcessDefinitions().get(0).getId();
        String key = deployment.getDeployedProcessDefinitions().get(0).getKey();
        int version = deployment.getDeployedProcessDefinitions().get(0).getVersion();
        return new OTFDeploymentResponse(deploymentId, key, id, version);
    }
}

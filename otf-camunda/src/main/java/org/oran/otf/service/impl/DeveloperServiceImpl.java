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
import org.oran.otf.camunda.service.CamundaShutdown;
import org.oran.otf.camunda.service.OtfExternalTaskService;
import org.oran.otf.camunda.service.OtfWorkflowTaskCleanupService;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.DeveloperService;
import com.google.common.base.Strings;

import java.util.Arrays;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.engine.impl.jobexecutor.JobExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DeveloperServiceImpl implements DeveloperService {
	
  private Logger logger = LoggerFactory.getLogger(DeveloperServiceImpl.class);
  
  @Autowired
  CamundaShutdown camundaShutdown;
  
  @Value("${otf.camunda.graceful-shutdown.wait-time}")
  private int gracefulWaitTime;

  private boolean gracefulShutdown = true;

  @Override
  public Response workflowTaskCleanup(String enabled) {
    if (Strings.isNullOrEmpty(enabled))
      return ResponseUtility.Build.badRequestWithMessage(
          "Path parameter, enabled, cannot be null or empty.");

    OtfWorkflowTaskCleanupService.isEnabled = enabled.equalsIgnoreCase("true");
    return ResponseUtility.Build.okRequestWithMessage(
        "Clean up service set to " + OtfWorkflowTaskCleanupService.isEnabled);
  }

  @Override
  public Response externalTaskWorker(String enabled) {
    if (Strings.isNullOrEmpty(enabled)) {
      return ResponseUtility.Build.badRequestWithMessage(
          "Path parameter, enabled, cannot be null or empty.");
    }

    OtfExternalTaskService.isEnabled = enabled.equalsIgnoreCase("true");
    return ResponseUtility.Build.okRequestWithMessage(
        "OTF External Task set to " + OtfExternalTaskService.isEnabled);
  }

  @Override
  public Response printThreads(HttpServletRequest request) {
    //Logger logger = LoggerFactory.getLogger(HealthServiceImpl.class);
    String message = String.format("Health request from %s.", request.getRemoteAddr());
    logger.info(message);

    WorkflowTask.printWorkflowTaskResources();
    logger.info("");
    logger.info("");
    WorkflowTask.printThreadInformation();

    return ResponseUtility.Build.okRequestWithMessage(message);
  }
  
  @Override
  public Response activateJobExecutor() {
	JobExecutor jobExecutor = ((ProcessEngineConfigurationImpl) (BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName)).getProcessEngineConfiguration()).getJobExecutor();
    if (!jobExecutor.isActive()) {
		jobExecutor.start();
    }
	return ResponseUtility.Build.okRequest();
  }

  @Override
  public Response deActivateJobExecutor() {
	JobExecutor jobExecutor = ((ProcessEngineConfigurationImpl) (BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName)).getProcessEngineConfiguration()).getJobExecutor();
	if (jobExecutor.isActive()) {
		jobExecutor.shutdown();
	}
	return ResponseUtility.Build.okRequest();
  }
  
  @Override
  public Response gracefulShutdown() {
	  return this.gracefulShutdown ? ResponseUtility.Build.okRequestWithMessage(shutdown()) : ResponseUtility.Build.okRequestWithMessage("Graceful shutdown is disabled.");
  }

    @Override
    public Response disableGracefulShutdown() {
        this.gracefulShutdown = false;
        return ResponseUtility.Build.okRequest();
    }

    @Override
    public Response enableGracefulShutdown() {
        this.gracefulShutdown = true;
        return ResponseUtility.Build.okRequest();
    }

    @EventListener(ContextClosedEvent.class)
  private String shutdown() {
	  String message = "Graceful shutdown:";
	  String returnMessage = "Graceful shutdown processes terminated: ";
	  try {
	      //disable external task service
          OtfExternalTaskService.isEnabled = false;
          //disable job executor
		  deActivateJobExecutor();
          logger.info("Disabled job executor and external task service.");
          logger.info("Starting to sleep...");
          Thread.sleep(gracefulWaitTime);
          logger.info("ending to sleep...calling termination service");
		  // Call Termination service
		  Set<String> processInterrupted = camundaShutdown.gracefulShutdown();
          returnMessage = returnMessage + " " + processInterrupted.size();
		  message += String.format("processesInterrupted %s ",
		        Arrays.toString(processInterrupted.toArray()));

		  logger.info(message += String.format("processesInterrupted %s ",
                  Arrays.toString(processInterrupted.toArray())));
	  } catch (InterruptedException e) {
		  return "Graceful shutdown processes encountered an error.";
	  }
	  return returnMessage;
  }



  
}

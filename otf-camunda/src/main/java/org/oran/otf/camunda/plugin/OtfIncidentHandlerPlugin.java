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


package org.oran.otf.camunda.plugin;

import org.oran.otf.camunda.workflow.handler.ExternalTaskIncidentHandler;
import org.oran.otf.camunda.workflow.handler.FailedJobIncidentHandler;
import java.util.Arrays;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.engine.impl.cfg.ProcessEnginePlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OtfIncidentHandlerPlugin implements ProcessEnginePlugin {

  private static final Logger logger = LoggerFactory.getLogger(OtfIncidentHandlerPlugin.class);

  @Autowired
  private FailedJobIncidentHandler failedJobIncidentHandler;
  @Autowired
  private ExternalTaskIncidentHandler externalTaskIncidentHandler;

  @Override
  public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
    logger.info("Adding Open Test Framework custom incident handlers.");
    processEngineConfiguration.setCustomIncidentHandlers(
        Arrays.asList(failedJobIncidentHandler, externalTaskIncidentHandler));
  }

  @Override
  public void postInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
  }

  @Override
  public void postProcessEngineBuild(ProcessEngine processEngine) {
  }
}

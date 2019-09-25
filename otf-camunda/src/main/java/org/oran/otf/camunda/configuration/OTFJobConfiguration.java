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


package org.oran.otf.camunda.configuration;

import org.oran.otf.camunda.configuration.listener.OTFJobExecutorStartingEventListener;
import org.camunda.bpm.engine.impl.jobexecutor.JobExecutor;
import org.camunda.bpm.engine.spring.SpringProcessEngineConfiguration;
import org.camunda.bpm.spring.boot.starter.configuration.impl.DefaultJobConfiguration;
import org.camunda.bpm.spring.boot.starter.event.JobExecutorStartingEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class OTFJobConfiguration extends DefaultJobConfiguration {
  @Autowired protected JobExecutor jobExecutor;

  @Override
  protected void configureJobExecutor(SpringProcessEngineConfiguration configuration) {
    int podNumber = -1;
    String[] hostnameSplit = {"0", "0", "0"};

    try {
      String hostname = System.getenv("HOSTNAME");
      hostnameSplit = hostname.split("-");
      podNumber = Integer.parseInt(hostnameSplit[2]);
    } catch (Exception e) {
      podNumber = 1;
    }

    //if (podNumber == 1) {
      camundaBpmProperties.getJobExecution().setLockTimeInMillis(43200000);
      camundaBpmProperties.getJobExecution().setBackoffTimeInMillis(90);
      camundaBpmProperties.getJobExecution().setMaxBackoff(450L);
      camundaBpmProperties.getJobExecution().setWaitIncreaseFactor(2f);

      super.configureJobExecutor(configuration);

      configuration.getJobExecutor().setLockTimeInMillis(43200000);
      configuration.getJobExecutor().setBackoffTimeInMillis(90);
      configuration.getJobExecutor().setMaxBackoff(450L);
      configuration.getJobExecutor().setWaitIncreaseFactor(2);


      // configuration.getJobExecutor().setAutoActivate(false);
   // }
  }

  @Bean
  @Primary
  @ConditionalOnProperty(prefix = "camunda.bpm.job-execution", name = "enabled", havingValue = "true", matchIfMissing = true)
  @ConditionalOnBean(JobExecutor.class)
  public static JobExecutorStartingEventListener jobExecutorStartingEventListener() {
    return new OTFJobExecutorStartingEventListener();
  }
}

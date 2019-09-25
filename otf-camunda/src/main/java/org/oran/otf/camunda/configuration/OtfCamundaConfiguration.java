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

import com.google.common.base.Strings;
import java.util.Optional;
import java.util.UUID;
import javax.sql.DataSource;
import org.camunda.bpm.application.impl.event.ProcessApplicationEventListenerPlugin;
import org.camunda.bpm.engine.ProcessEngineConfiguration;
import org.camunda.bpm.engine.impl.cfg.IdGenerator;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.engine.impl.history.HistoryLevel;
import org.camunda.bpm.engine.spring.SpringProcessEngineConfiguration;
import org.camunda.bpm.extension.reactor.bus.CamundaEventBus;
import org.camunda.bpm.extension.reactor.plugin.ReactorProcessEnginePlugin;
import org.camunda.bpm.extension.reactor.projectreactor.EventBus;
import org.camunda.bpm.spring.boot.starter.configuration.impl.DefaultProcessEngineConfiguration;
import org.camunda.connect.plugin.impl.ConnectProcessEnginePlugin;
import org.camunda.spin.plugin.impl.SpinProcessEnginePlugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.util.StringUtils;

@Configuration
public class OtfCamundaConfiguration extends DefaultProcessEngineConfiguration {

  @Autowired
  private DataSource dataSource;
  @Autowired
  private PlatformTransactionManager transactionManager;
  @Autowired private Optional<IdGenerator> idGenerator;

  public static String processEngineName;

  @Bean
  public ProcessEngineConfiguration configureEngine(ProcessEngineConfigurationImpl configuration) {
    configuration.setJavaSerializationFormatEnabled(true);
    return configuration;
  }

  @Override
  public void preInit(SpringProcessEngineConfiguration configuration) {

    logger.info(configuration.getProcessEngineName());
    processEngineName = System.getenv("HOSTNAME");
    if (Strings.isNullOrEmpty(processEngineName)) {
      processEngineName = "otf-camunda-" + UUID.randomUUID().toString();
    }
    processEngineName = processEngineName.replaceAll("-", "_");
    camundaBpmProperties.setProcessEngineName(processEngineName);
    camundaBpmProperties.setAutoDeploymentEnabled(true);
    camundaBpmProperties.setHistoryLevel(HistoryLevel.HISTORY_LEVEL_FULL.getName());
    camundaBpmProperties.setDefaultNumberOfRetries(1);

    setProcessEngineName(configuration);
    setDefaultSerializationFormat(configuration);
    setIdGenerator(configuration);
    setJobExecutorAcquireByPriority(configuration);
    setDefaultNumberOfRetries(configuration);

    configuration.setDataSource(dataSource);
    configuration.setTransactionManager(transactionManager);
    configuration.setHistory("true");
    configuration.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);
    configuration.setJobExecutorActivate(true);
    configuration.setCreateIncidentOnFailedJobEnabled(true);
    configuration.setFailedJobListenerMaxRetries(0);
    configuration.setJavaSerializationFormatEnabled(true);
    configuration.setMetricsEnabled(false);
  }

  private void setIdGenerator(SpringProcessEngineConfiguration configuration) {
    idGenerator.ifPresent(configuration::setIdGenerator);
  }

  private void setDefaultSerializationFormat(SpringProcessEngineConfiguration configuration) {
    String defaultSerializationFormat = camundaBpmProperties.getDefaultSerializationFormat();
    if (StringUtils.hasText(defaultSerializationFormat)) {
      configuration.setDefaultSerializationFormat(defaultSerializationFormat);
    } else {
      logger.warn("Ignoring invalid defaultSerializationFormat='{}'", defaultSerializationFormat);
    }
  }

  private void setProcessEngineName(SpringProcessEngineConfiguration configuration) {
    String processEngineName =
        StringUtils.trimAllWhitespace(camundaBpmProperties.getProcessEngineName());
    if (!StringUtils.isEmpty(processEngineName) && !processEngineName.contains("-")) {
      configuration.setProcessEngineName(processEngineName);
    } else {
      logger.warn(
          "Ignoring invalid processEngineName='{}' - must not be null, blank or contain hyphen",
          camundaBpmProperties.getProcessEngineName());
    }
  }

  private void setJobExecutorAcquireByPriority(SpringProcessEngineConfiguration configuration) {
    Optional.ofNullable(camundaBpmProperties.getJobExecutorAcquireByPriority())
        .ifPresent(configuration::setJobExecutorAcquireByPriority);
  }

  private void setDefaultNumberOfRetries(SpringProcessEngineConfiguration configuration) {
    Optional.ofNullable(camundaBpmProperties.getDefaultNumberOfRetries())
        .ifPresent(configuration::setDefaultNumberOfRetries);
  }

  @Bean
  CamundaEventBus camundaEventBus() {
    return new CamundaEventBus();
  }

  @Bean
  @Qualifier("camunda")
  EventBus eventBus(final CamundaEventBus camundaEventBus) {
    return camundaEventBus.get();
  }

  @Bean
  ReactorProcessEnginePlugin reactorProcessEnginePlugin(final CamundaEventBus camundaEventBus) {
    return new ReactorProcessEnginePlugin(camundaEventBus);
  }

  @Bean
  ConnectProcessEnginePlugin connectProcessEnginePlugin() {
    return new ConnectProcessEnginePlugin();
  }

  @Bean
  SpinProcessEnginePlugin spinProcessEnginePlugin() {
    return new SpinProcessEnginePlugin();
  }

  @Bean
  ProcessApplicationEventListenerPlugin processApplicationEventListenerPlugin() {
    return new ProcessApplicationEventListenerPlugin();
  }
}

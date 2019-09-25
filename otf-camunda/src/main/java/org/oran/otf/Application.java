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


package org.oran.otf;

import java.util.List;
import java.util.concurrent.Executor;
import org.camunda.bpm.application.PostDeploy;
import org.camunda.bpm.application.PreUndeploy;
import org.camunda.bpm.application.ProcessApplicationInfo;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@SpringBootApplication
@EnableAsync
@ComponentScan(basePackages = "org.oran.otf")
@EnableProcessApplication
@EnableAutoConfiguration(
    exclude = {
        ErrorMvcAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        MongoAutoConfiguration.class
    })
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);

  }

  private static final Logger logger = LoggerFactory.getLogger(Application.class);

  @Value("${otf.camunda.executor.async.core-pool-size}")
  private int corePoolSize;

  @Value("${otf.camunda.executor.async.max-pool-size}")
  private int maxPoolSize;

  @Value("${otf.camunda.executor.async.queue-capacity}")
  private int queueCapacity;

  private static final String LOGS_DIR = "logs_dir";


  private static void setLogsDir() {
    if (System.getProperty(LOGS_DIR) == null) {
      System.getProperties().setProperty(LOGS_DIR, "./logs/camunda/");
    }
  }

  @PostDeploy
  public void postDeploy(ProcessEngine processEngineInstance) {}

  @PreUndeploy
  public void cleanup(ProcessEngine processEngine, ProcessApplicationInfo processApplicationInfo,
      List<ProcessEngine> processEngines) {}

  @Bean
  @Primary
  public Executor asyncExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    //executor.setTaskDecorator(new MDCTaskDecorator());
    executor.setCorePoolSize(corePoolSize);
    executor.setMaxPoolSize(maxPoolSize);
    executor.setQueueCapacity(queueCapacity);
    executor.setThreadNamePrefix("Camunda-");
    executor.initialize();
    return executor;
  }
}

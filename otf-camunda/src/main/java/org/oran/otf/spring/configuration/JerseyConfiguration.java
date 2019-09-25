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


package org.oran.otf.spring.configuration;

import org.oran.otf.service.impl.DeleteProcessInstanceServiceImpl;
import org.oran.otf.service.impl.DeleteTestDefinitionServiceImpl;
import org.oran.otf.service.impl.DeveloperServiceImpl;
import org.oran.otf.service.impl.HealthServiceImpl;
import org.oran.otf.service.impl.ProcessInstanceCompletionServiceImpl;
import org.oran.otf.service.impl.TestControlUnitServiceImpl;
import org.oran.otf.service.impl.TestDefinitionDeploymentServiceImpl;

import java.util.logging.Logger;
import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;
import org.glassfish.jersey.servlet.ServletContainer;
import org.glassfish.jersey.servlet.ServletProperties;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*
 * Note: JerseyAutoConfiguration is used to incorporate camunda rest api In this configuration class
 * we create a new servletregistrationbean to serve at /service/* while camunda serves at /rest/*
 */
@Configuration
public class JerseyConfiguration {

  private static final Logger logger = Logger.getLogger(JerseyConfiguration.class.getName());

  @Bean
  public ServletRegistrationBean<ServletContainer> applicationJersey() {
    ServletRegistrationBean<ServletContainer> applicationJersey =
        new ServletRegistrationBean<>(new ServletContainer(new ApplicationJerseyConfig()));
    applicationJersey.addUrlMappings("/otf/*");
    applicationJersey.setName("Open Test Framework - Test Control Unit");
    applicationJersey.setLoadOnStartup(0);
    return applicationJersey;
  }

  public class ApplicationJerseyConfig extends ResourceConfig {

    public ApplicationJerseyConfig() {
      register(MultiPartFeature.class);
//      register(
//          new OTFLoggingFeature(
//              Logger.getLogger(getClass().getName()),
//              Level.INFO,
//              LoggingFeature.Verbosity.PAYLOAD_ANY,
//              8192));

      logger.info("Registering REST resources.");
      register(TestControlUnitServiceImpl.class);
      register(HealthServiceImpl.class);
      register(DeleteTestDefinitionServiceImpl.class);
      register(ProcessInstanceCompletionServiceImpl.class);
      register(TestDefinitionDeploymentServiceImpl.class);
      register(DeleteProcessInstanceServiceImpl.class);
      register(DeveloperServiceImpl.class);

      property(ServletProperties.FILTER_FORWARD_ON_404, true);
      property(ServerProperties.RESPONSE_SET_STATUS_OVER_SEND_ERROR, true);
      register(new LoggingFeature(logger));
      logger.info("Finished registering REST resources.");
    }
  }
}

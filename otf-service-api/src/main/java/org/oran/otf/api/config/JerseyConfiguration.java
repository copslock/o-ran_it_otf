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


package org.oran.otf.api.config;

import org.oran.otf.api.service.impl.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;
import org.glassfish.jersey.servlet.ServletProperties;
import org.oran.otf.api.service.impl.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@ApplicationPath("/otf/api")
public class JerseyConfiguration extends ResourceConfig {
  private static final Logger log = Logger.getLogger(JerseyConfiguration.class.getName());

  //   @Value("${spring.jersey.application-path}")
  //   private String apiPath;

  //  @Value("${springfox.documentation.swagger.v2.path}")
  //  private String swagger2Endpoint;

  @Autowired
  public JerseyConfiguration() {
    registerFeatures();
    registerEndpoints();
    setProperties();

    configureSwagger();
  }


  private void registerFeatures() {
    register(MultiPartFeature.class);
    register(new OTFLoggingFeature(Logger.getLogger(getClass().getName()), Level.INFO, LoggingFeature.Verbosity.PAYLOAD_ANY, 8192));

  }

  private void registerEndpoints() {
    register(TestInstanceServiceImpl.class);
    register(HealthServiceImpl.class);
    register(TestStrategyServiceImpl.class);
    register(TestExecutionServiceImpl.class);
    register(VirtualTestHeadServiceImpl.class);

    register(OtfOpenServiceImpl.class);
  }

  private void setProperties() {
    property(ServletProperties.FILTER_FORWARD_ON_404, true);
    property(ServerProperties.RESPONSE_SET_STATUS_OVER_SEND_ERROR, true);
  }

  private void configureSwagger() {
    OpenApiResource openApiResource = new OpenApiResource();

    register(openApiResource);
  }

  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    objectMapper.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES);
    objectMapper.enable(DeserializationFeature.READ_ENUMS_USING_TO_STRING);
    return objectMapper;
  }
}

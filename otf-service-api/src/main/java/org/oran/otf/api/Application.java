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


package org.oran.otf.api;

import static com.google.common.collect.Sets.newHashSet;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@Configuration
@EnableAutoConfiguration(
    exclude = {
      ErrorMvcAutoConfiguration.class,
      DataSourceAutoConfiguration.class,
      HibernateJpaAutoConfiguration.class,
    })
@ComponentScan(basePackages = "org.oran.otf")
@EnableSwagger2
@OpenAPIDefinition(
    info =
        @Info(
            title = "Open Test Framework API",
            version = "1.0",
            description = "A RESTful API used to communicate with the OTF test control unit.",
            contact = @Contact(url = "https://localhost:32524", name = "OTF")))
public class Application {
  private static final Log log = LogFactory.getLog(Application.class);

  public static void main(String[] args) {
    ApplicationContext ctx = SpringApplication.run(Application.class, args);
  }

  @Bean
  public Docket testInstanceApi() {
    return new Docket(DocumentationType.SWAGGER_2)
        .select()
        // .apis(testInstancePath())
        .paths(PathSelectors.any())
        .build()
        .protocols(newHashSet("https"));
  }
}

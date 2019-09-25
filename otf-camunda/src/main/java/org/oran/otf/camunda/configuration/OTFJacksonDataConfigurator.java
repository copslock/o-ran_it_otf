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

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.kotlin.KotlinModule;
import org.camunda.spin.impl.json.jackson.format.JacksonJsonDataFormat;
import org.camunda.spin.spi.DataFormatConfigurator;
import org.springframework.context.annotation.Configuration;
import spinjar.com.fasterxml.jackson.databind.ObjectMapper;
import spinjar.com.fasterxml.jackson.databind.module.SimpleModule;

@Configuration
public class OTFJacksonDataConfigurator implements DataFormatConfigurator<JacksonJsonDataFormat> {

  @Override
  public Class<JacksonJsonDataFormat> getDataFormatClass() {
    return JacksonJsonDataFormat.class;
  }

  @Override
  public void configure(JacksonJsonDataFormat dataFormat) {
    ObjectMapper mapper = dataFormat.getObjectMapper();
    SimpleModule module = new SimpleModule();
    module.registerSubtypes(KotlinModule.class);
    module.registerSubtypes(JavaTimeModule.class);
    mapper.registerModule(module);
  }
}

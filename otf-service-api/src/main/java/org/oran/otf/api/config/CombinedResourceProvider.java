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

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Resource;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import springfox.documentation.swagger.web.InMemorySwaggerResourcesProvider;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;

@Component
@Primary
public class CombinedResourceProvider implements SwaggerResourcesProvider {

  @Resource private InMemorySwaggerResourcesProvider inMemorySwaggerResourcesProvider;

  public List<SwaggerResource> get() {

    SwaggerResource jerseySwaggerResource = new SwaggerResource();
    jerseySwaggerResource.setLocation("/otf/api/openapi.json");
    jerseySwaggerResource.setSwaggerVersion("2.0");
    jerseySwaggerResource.setName("Service API");

    return Stream.concat(
            Stream.of(jerseySwaggerResource), inMemorySwaggerResourcesProvider.get().stream())
        .collect(Collectors.toList());
  }
}

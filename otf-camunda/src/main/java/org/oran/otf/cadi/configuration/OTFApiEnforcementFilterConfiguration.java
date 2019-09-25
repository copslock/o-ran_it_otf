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


package org.oran.otf.cadi.configuration;

import org.oran.otf.cadi.filter.OTFApiEnforcementFilter;
import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import org.onap.aaf.cadi.Access;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@PropertySource("classpath:application.yaml")
@Configuration
@Conditional(value = FilterCondition.class)
public class OTFApiEnforcementFilterConfiguration {

  @Value("${otf.cadi.aaf-perm-type}")
  private String AAF_PERM_TYPE;

  private Access access;
  private FilterConfig fc;

  @Bean(name = "otfApiEnforcementFilterRegistrationBean")
//  @ConditionalOnProperty(prefix ="otf.cadi", name ="enabled", havingValue = "true" ,matchIfMissing = true)
  @Conditional(value = FilterCondition.class)
  public FilterRegistrationBean<Filter> otfApiEnforcementFilterRegistration()
      throws ServletException {
    FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
    initFilterParameters(registration);

    registration.addUrlPatterns("/otf/tcu/*", "/rest/*");
    registration.setFilter(otfApiEnforcementFilter());
    registration.setName("otfApiEnforcementFilter");
    registration.setOrder(1);
    return registration;
  }

  @Bean(name = "otfApiEnforcementFilter")
  @Conditional(value = FilterCondition.class)
//  @ConditionalOnProperty(prefix ="otf.cadi", name ="enabled", havingValue = "true", matchIfMissing = true)
  Filter otfApiEnforcementFilter() throws ServletException {
    return new OTFApiEnforcementFilter(access, AAF_PERM_TYPE);
  }

  private void initFilterParameters(FilterRegistrationBean<Filter> registration) {
    registration.addInitParameter("aaf_perm_type", AAF_PERM_TYPE);
  }
}

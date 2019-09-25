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

import javax.servlet.Filter;
import org.onap.aaf.cadi.Access.Level;
import org.onap.aaf.cadi.config.Config;
import org.onap.aaf.cadi.filter.CadiFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@PropertySource("classpath:application.yaml")
@Configuration
@Conditional(value = FilterCondition.class)
public class CadiFilterConfiguration {

  @Value("${otf.cadi.aaf-mech-id}")
  private String AAF_APPID;

  @Value("${otf.cadi.aaf-mech-password}")
  private String AAF_APPPASS;

  @Value("${otf.cadi.hostname}")
  private String CADI_HOSTNAME;

  @Value("${otf.cadi.keyfile}")
  private String CADI_KEYFILE;

  @Value("${otf.ssl.keystore-path}")
  private String CADI_KEYSTORE;

  @Value("${otf.ssl.keystore-password}")
  private String CADI_KEYSTORE_PASSWORD;

  @Bean(name = "cadiFilterRegistrationBean")
//  @ConditionalOnProperty(prefix = "otf.cadi", name = "enabled", havingValue = "true", matchIfMissing = true)
  public FilterRegistrationBean<Filter> cadiFilterRegistration() {
    FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
    // set cadi configuration properties
    initCadiProperties(registration);

    registration.addUrlPatterns("/otf/tcu/*", "/rest/*");
    registration.setFilter(cadiFilter());
    registration.setName("otfCadiFilter");
    registration.setOrder(0);
    return registration;
  }

  Filter cadiFilter() {
    return new CadiFilter();
  }

  private void initCadiProperties(FilterRegistrationBean<Filter> registration) {
    registration.addInitParameter(Config.AAF_APPID, AAF_APPID);
    registration.addInitParameter(Config.AAF_APPPASS, AAF_APPPASS);
    registration.addInitParameter(Config.AAF_CALL_TIMEOUT, "10000");
    registration.addInitParameter(Config.AAF_CONN_TIMEOUT, "6000");
    registration.addInitParameter(Config.AAF_DEFAULT_REALM, "localhost");
    registration.addInitParameter(Config.AAF_ENV, "PROD");
    registration.addInitParameter(Config.AAF_LOCATE_URL, "https://localhost");
    registration.addInitParameter(Config.AAF_LUR_CLASS, "org.onap.aaf.cadi.aaf.v2_0.AAFLurPerm");
    registration.addInitParameter(
        Config.AAF_URL, "https://localhost");

    registration.addInitParameter(Config.BASIC_REALM, "localhost");
    registration.addInitParameter(Config.BASIC_WARN, "true");

    registration.addInitParameter(Config.CADI_KEYFILE, CADI_KEYFILE);
    registration.addInitParameter(Config.CADI_LATITUDE, "38.62782");
    registration.addInitParameter(Config.CADI_LOGLEVEL, Level.ERROR.name());
    registration.addInitParameter(Config.CADI_LONGITUDE, "-90.19458");
    registration.addInitParameter(Config.CADI_NOAUTHN, "/health/v1");
    registration.addInitParameter(Config.CADI_PROTOCOLS, "TLSv1.1,TLSv1.2");
    registration.addInitParameter(Config.CADI_KEYSTORE, CADI_KEYSTORE);
    registration.addInitParameter(Config.CADI_KEYSTORE_PASSWORD, CADI_KEYSTORE_PASSWORD);

    registration.addInitParameter(Config.HOSTNAME, CADI_HOSTNAME);
  }
}

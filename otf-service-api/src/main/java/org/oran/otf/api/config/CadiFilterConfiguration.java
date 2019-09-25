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

import javax.servlet.Filter;
import org.onap.aaf.cadi.Access;
import org.onap.aaf.cadi.config.Config;
import org.onap.aaf.cadi.filter.CadiFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@PropertySource("classpath:application.properties")
@Component
@ConditionalOnProperty(prefix = "aaf",name ="enabled",havingValue = "true",matchIfMissing = true)
public class CadiFilterConfiguration {

  @Value("${aaf.call-timeout}")
  private String AAF_CALL_TIMEOUT;

  @Value("${aaf.conn-timeout}")
  private String AAF_CONN_TIMEOUT;

  @Value("${aaf.default-realm}")
  private String AAF_DEFAULT_REALM;

  @Value("${aaf.env}")
  private String AAF_ENV;

  @Value("${aaf.locate-url}")
  private String AAF_LOCATE_URL;

  @Value("${aaf.lur-class}")
  private String AAF_LUR_CLASS;

  @Value("${aaf.url}")
  private String AAF_URL;

  @Value("${basic-realm}")
  private String BASIC_REALM;

  @Value("${basic-warn}")
  private String BASIC_WARN;

  @Value("${cadi-latitude}")
  private String CADI_LATITUDE;

  @Value("${cadi-longitude}")
  private String CADI_LONGITUDE;

  @Value("${cadi-protocols}")
  private String CADI_PROTOCOLS;

  @Value("${cadi-noauthn}")
  private String CADI_NOAUTHN;

  @Bean(name = "cadiFilterRegistrationBean")
  @ConditionalOnProperty(prefix = "aaf",name ="enabled",havingValue = "true",matchIfMissing = true)
  public FilterRegistrationBean<Filter> cadiFilterRegistration() {
    FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
    // set cadi configuration properties
    initCadiProperties(registration);

    registration.addUrlPatterns("/otf/api/testInstance/*", "/otf/api/testExecution/*", "/otf/api/testStrategy/*", "/otf/api/virtualTestHead/*");
    registration.setFilter(cadiFilter());
    registration.setName("otfCadiFilter");
    registration.setOrder(0);
    return registration;
  }

  public Filter cadiFilter() {
    return new CadiFilter();
  }

  private void initCadiProperties(FilterRegistrationBean<Filter> registration) {
    registration.addInitParameter(Config.AAF_APPID, System.getenv("AAF_ID"));
    registration.addInitParameter(Config.AAF_APPPASS, System.getenv("AAF_PASSWORD"));
    registration.addInitParameter(Config.AAF_CALL_TIMEOUT, AAF_CALL_TIMEOUT);
    registration.addInitParameter(Config.AAF_CONN_TIMEOUT, AAF_CONN_TIMEOUT);
    registration.addInitParameter(Config.AAF_DEFAULT_REALM, AAF_DEFAULT_REALM);
    registration.addInitParameter(Config.AAF_ENV, AAF_ENV);
    registration.addInitParameter(Config.AAF_LOCATE_URL, AAF_LOCATE_URL);
    registration.addInitParameter(Config.AAF_LUR_CLASS, AAF_LUR_CLASS);
    registration.addInitParameter(
        Config.AAF_URL, AAF_URL);

    registration.addInitParameter(Config.BASIC_REALM, BASIC_REALM);
    registration.addInitParameter(Config.BASIC_WARN, BASIC_WARN);

    registration.addInitParameter(Config.CADI_KEYFILE, System.getenv("CADI_KEYFILE"));
    registration.addInitParameter(Config.CADI_LATITUDE, CADI_LATITUDE);
    //registration.addInitParameter(Config.CADI_LOGLEVEL, Access.Level.DEBUG.name());
    registration.addInitParameter(Config.CADI_LONGITUDE, CADI_LONGITUDE);
    registration.addInitParameter(Config.CADI_NOAUTHN, CADI_NOAUTHN);
    registration.addInitParameter(Config.CADI_PROTOCOLS, CADI_PROTOCOLS);
    registration.addInitParameter(Config.CADI_KEYSTORE, System.getenv("OTF_CERT_PATH"));
    registration.addInitParameter(Config.CADI_KEYSTORE_PASSWORD, System.getenv("OTF_CERT_PASS"));

    registration.addInitParameter(Config.HOSTNAME, System.getenv("CADI_HOSTNAME"));
  }
}

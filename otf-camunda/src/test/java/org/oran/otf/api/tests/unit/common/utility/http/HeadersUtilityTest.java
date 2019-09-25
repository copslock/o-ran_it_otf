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


package org.oran.otf.api.tests.unit.common.utility.http;

import org.oran.otf.common.utility.http.HeadersUtility;
import java.util.HashMap;
import java.util.Map;
import org.assertj.core.api.Assertions;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class HeadersUtilityTest {
  public Map<String, String> headers;

  @Before
  public void setup(){
    headers = new HashMap<>();
    headers.put("GET", "/some/random/route/exmaple");
    headers.put("Host", "localhost");
    headers.put("Authorization", "Basic som3R4ndOmStringK3y");
    headers.put("User-Agent", "James Bond");
    headers.put("Accept", "*/*");

  }
  @Test
  public void authIsMasked(){

    System.out.println("Authorization header in format 'Basic: key' will mask the auth with 4 *");
    Map<String, String> maskedAuth = HeadersUtility.maskAuth(headers);
    Assertions.assertThat(maskedAuth.get("Authorization")).isEqualTo("Basic ****");
  }
  @Test
  public void originalHeadersDidNotChange(){
    System.out.println("Make sure HeaderUtility.maskAuth() does not change the map passed to function");
    Map<String, String> maskedAuth = HeadersUtility.maskAuth(headers);
    Assertions.assertThat(headers.get("Authorization")).isEqualTo("Basic som3R4ndOmStringK3y");
  }

  @Test
  public void noAuthHeadersPassed(){
    System.out.println("Make sure HeaderUtility.maskAuth() works if headers are missing a Authorization field");
    headers.remove("Authorization");
    Map<String, String> maskedAuth = HeadersUtility.maskAuth(headers);
    Assertions.assertThat(maskedAuth).isEqualTo(headers);
  }

  @Test
  public void authKeyFormatHasNoSpace(){
    System.out.println("Make sure HeaderUtility.maskAuth() works if Authorization does not follow format 'Authorization: [Type] [Key]'");
    headers.put("Authorization", "Basicsom3R4ndOmStringK3y");
    Map<String, String> maskedAuth = HeadersUtility.maskAuth(headers);
    Assertions.assertThat(maskedAuth.get("Authorization")).isEqualTo("****");
  }

}

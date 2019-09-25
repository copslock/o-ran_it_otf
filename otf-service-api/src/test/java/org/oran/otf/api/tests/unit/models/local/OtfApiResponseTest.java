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


package org.oran.otf.api.tests.unit.models.local;

import org.oran.otf.common.model.local.OTFApiResponse;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class OtfApiResponseTest {
  private static OTFApiResponse otfApiResponse;
  @BeforeClass
  public static void setup(){
    otfApiResponse = new OTFApiResponse();
  }
  @Test
  public void testOtfApiResponseHasStatusCodeField(){
    Assertions.assertThat(otfApiResponse).hasFieldOrProperty("statusCode");
  }
  @Test
  public void testOtfApiResponseHasMessageField(){
    Assertions.assertThat(otfApiResponse).hasFieldOrProperty("message");
  }
  @Test
  public void testOtfApiResponseHasTimeField(){
    Assertions.assertThat(otfApiResponse).hasFieldOrProperty("time");
  }

}

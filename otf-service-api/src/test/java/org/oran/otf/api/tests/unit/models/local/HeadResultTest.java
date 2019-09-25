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

import org.oran.otf.common.model.local.TestHeadResult;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class HeadResultTest {
  private static TestHeadResult testHeadResult;

  @BeforeClass
  public static void setup(){
    testHeadResult = new TestHeadResult();
  }
  @Test
  public void testHeadResultHasTestHeadIdField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("testHeadId");
  }
  @Test
  public void testHeadResultHasTestHeadNameField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("testHeadName");
  }
  @Test
  public void testHeadResultHasBpmnVthTaskIdField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("bpmnVthTaskId");
  }
  @Test
  public void testHeadResultHasTestHeadRequestField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("testHeadRequest");
  }
  @Test
  public void testHeadResultHasTestHeadResponseField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("testHeadResponse");
  }
  @Test
  public void testHeadResultHasStartTimeField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("startTime");
  }
  @Test
  public void testHeadResultHasEndTimeField(){
    Assertions.assertThat(testHeadResult).hasFieldOrProperty("endTime");
  }

}

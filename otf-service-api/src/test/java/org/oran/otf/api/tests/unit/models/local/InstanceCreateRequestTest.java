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

import org.oran.otf.common.model.local.TestInstanceCreateRequest;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class InstanceCreateRequestTest {
  private static TestInstanceCreateRequest testInstanceCreateRequest;

  @BeforeClass
  public static void setup() throws Exception{
    //No Argument Constructor does not work because of the requiered name when creating
    testInstanceCreateRequest = new TestInstanceCreateRequest(
        "Name",
        "Description",
        null,
        null,
        null,
        null,
        null,
        true,
        false,
        0L
    );
  }

  @Test
  public void testInstanceCreateRequestHasTestDefinitionIdField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("testDefinitionId");
  }
  @Test
  public void testInstanceCreateRequestHasVersionField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("version");
  }
  @Test
  public void testInstanceCreateRequestHasProcessDefinitionKeyField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("processDefinitionKey");
  }
  @Test
  public void testInstanceCreateRequestHastestInstanceNameField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("testInstanceName");
  }
  @Test
  public void testInstanceCreateRequestHasPfloInputField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("pfloInput");
  }
  @Test
  public void testInstanceCreateRequestHasSimulationVthInputField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("simulationVthInput");
  }
  @Test
  public void testInstanceCreateRequestHasTestDataField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("testData");
  }
  @Test
  public void testInstanceCreateRequestHasVthInputField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("vthInput");
  }
  @Test
  public void testInstanceCreateRequestHasCreatedByField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("createdBy");
  }
  @Test
  public void testInstanceCreateRequestHasUseLatestTestDefinitionField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("useLatestTestDefinition");
  }
  @Test
  public void testInstanceCreateRequestHasSimulationModeField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("simulationMode");
  }
  @Test
  public void testInstanceCreateRequestHasMaxExecutionTimeInMillisField(){
    Assertions.assertThat(testInstanceCreateRequest).hasFieldOrProperty("maxExecutionTimeInMillis");
  }

}

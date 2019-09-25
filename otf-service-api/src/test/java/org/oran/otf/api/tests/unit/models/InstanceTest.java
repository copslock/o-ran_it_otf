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


package org.oran.otf.api.tests.unit.models;

import org.oran.otf.common.model.TestInstance;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class InstanceTest {

  private static TestInstance testInstance;

  @BeforeClass
  public static void setup(){
    testInstance = new TestInstance();
  }
  @Test
  public void testInstanceHasTestInstanceNameField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("testInstanceName");
  }
  @Test
  public void testInstanceHasInstanceDescriptionField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("testInstanceDescription");
  }
  @Test
  public void testInstanceHasGroupIdField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("groupId");
  }
  @Test
  public void testInstanceHasTestDefinitionIdField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("testDefinitionId");
  }
  @Test
  public void testInstanceHasProcessDefinitionIdField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("processDefinitionId");
  }
  @Test
  public void testInstanceHasUseLatestTestDefinitionField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("useLatestTestDefinition");
  }
  @Test
  public void testInstanceHasDisabledField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("disabled");
  }
  @Test
  public void testInstanceHasSimulationModeField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("simulationMode");
  }
  @Test
  public void testInstanceHasMaxExecutionTimeInMillisField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("maxExecutionTimeInMillis");
  }
  @Test
  public void testInstanceHasPfloInputField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("pfloInput");
  }
  @Test
  public void testInstanceHasInternalTestDataField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("internalTestData");
  }
  @Test
  public void testInstanceHasSimulationVthInputField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("simulationVthInput");
  }
  @Test
  public void testInstanceHasTestDataField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("testData");
  }
  @Test
  public void testInstanceHasVthInputField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("vthInput");
  }
  @Test
  public void testInstanceHasCreatedAtField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("createdAt");
  }
  @Test
  public void testInstanceHasUpdatedAtField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("updatedAt");
  }
  @Test
  public void testInstanceHasCreatedByField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("createdBy");
  }
  @Test
  public void testInstanceHasUpdatedByField(){
    Assertions.assertThat(testInstance).hasFieldOrProperty("updatedBy");
  }
}

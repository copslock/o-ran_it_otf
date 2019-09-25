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

import org.oran.otf.common.model.TestDefinition;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class DefinitionTest {
  private static TestDefinition testDefinition;

  @BeforeClass
  public static void setup(){
    testDefinition = new TestDefinition();
  }

  @Test
  public void testDefinitionHasTestNameField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("testName");
  }

  @Test
  public void testDefinitionHasTestDescriptionField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("testDescription");
  }
  @Test
  public void testDefinitionHasProcessDefinitionKeyField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("processDefinitionKey");
  }
  @Test
  public void testDefinitionHasBpmnInstancesField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("bpmnInstances");
  }
  @Test
  public void testDefinitionHasGroupIdField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("groupId");
  }
  @Test
  public void testDefinitionHasCreatedAtField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("createdAt");
  }
  @Test
  public void testDefinitionHasUpdateAtField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("updatedAt");
  }
  @Test
  public void testDefinitionHasCreatedByField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("createdBy");
  }
  @Test
  public void testDefinitionHasUpdatedByField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("updatedBy");
  }
  @Test
  public void testDefinitionHasDisabledField(){
    Assertions.assertThat(testDefinition).hasFieldOrProperty("disabled");
  }









}

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

import org.oran.otf.common.model.local.BpmnInstance;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class BpmnTest {
  private static BpmnInstance bpmnInstance;
  @BeforeClass
  public static void setup(){
    bpmnInstance = new BpmnInstance();
  }
  @Test
  public  void testBpmnInstanceHasProcessDefinitionIdField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("processDefinitionId");
  }
  @Test
  public   void testBpmnInstanceHasDeploymentIdField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("deploymentId");
  }
  @Test
  public  void testBpmnInstanceHasVersionField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("version");
  }
  @Test
  public  void testBpmnInstanceHasBpmnFileIdField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("bpmnFileId");
  }
  @Test
  public  void testBpmnInstanceHasResourceFileIdField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("resourceFileId");
  }
  @Test
  public  void testBpmnInstanceHasIsDeployedField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("isDeployed");
  }
  @Test
  public  void testBpmnInstanceHasTestHeadsField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("testHeads");
  }
  @Test
  public  void testBpmnInstanceHasPflowsField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("pflos");
  }
  @Test
  public  void testBpmnInstanceHasTestDataTemplateField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("testDataTemplate");
  }
  @Test
  public  void testBpmnInstanceHasCreatedAtField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("createdAt");
  }
  @Test
  public  void testBpmnInstanceUpdatedAtField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("updatedAt");
  }
  @Test
  public  void testBpmnInstanceHasCreatedByField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("createdBy");
  }
  @Test
  public  void testBpmnInstanceHasUpdatedByField(){
    Assertions.assertThat(bpmnInstance).hasFieldOrProperty("updatedBy");
  }

}

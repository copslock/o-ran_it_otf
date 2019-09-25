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

import org.oran.otf.common.model.local.WorkflowRequest;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class WorkFlowRequestTest {
  private static WorkflowRequest workflowRequest;

  @BeforeClass
  public static void setup()throws Exception{
    workflowRequest = new WorkflowRequest();
  }

  @Test
  public void testWorkFlowRequestHasAsyncField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("async");
  }
  @Test
  public void testWorkFlowRequestHasExecutorIdField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("executorId");
  }
  @Test
  public void testWorkFlowRequestHasTestInstanceIdField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("testInstanceId");
  }
  @Test
  public void testWorkFlowRequestHasPfloInputField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("pfloInput");
  }
  @Test
  public void testWorkFlowRequestHasTestDataField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("testData");
  }
  @Test
  public void testWorkFlowRequestHasVthInputField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("vthInput");
  }
  @Test
  public void testWorkFlowRequestHasMaxExecutionTimeInMillisField(){
    Assertions.assertThat(workflowRequest).hasFieldOrProperty("maxExecutionTimeInMillis");
  }

}

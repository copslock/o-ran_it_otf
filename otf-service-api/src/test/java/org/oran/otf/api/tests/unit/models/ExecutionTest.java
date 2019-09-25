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

import org.oran.otf.common.model.TestExecution;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class ExecutionTest {
  private static TestExecution testExecution;

  @BeforeClass
  public static void setup(){
    testExecution = new TestExecution();
  }

  @Test
  public void testExecutionHasGroupIdField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("groupId");
  }
  @Test
  public void testExecutionHasExecutorIdField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("executorId");
  }
  @Test
  public void testExecutionHasAsyncField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("async");
  }
  @Test
  public void testExecutionHasStartTimeField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("startTime");
  }
  @Test
  public void testExecutionHasEndTimeField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("endTime");
  }
  @Test
  public void testExecutionHasAsyncTopicField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("asyncTopic");
  }
  @Test
  public void testExecutionHasBussinessKeyField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("businessKey");
  }
  @Test
  public void testExecutionHasProcessInstanceIdField(){
    Assertions.assertThat(testExecution).hasFieldOrProperty("processInstanceId");
  }
  @Test
  public void testExecutionHasTestResultField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("testResult");
  }
  @Test
  public void testExecutionHasTestResultMessageField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("testResultMessage");
  }
  @Test
  public void testExecutionHasTestDetailsField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("testDetails");
  }
  @Test
  public void testExecutionHasTestHeadResultsField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("testHeadResults");
  }
  @Test
  public void testExecutionHasTestInstanceResultsField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("testInstanceResults");
  }
  @Test
  public void testExecutionHasHistoricEmailField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("historicEmail");
  }
  @Test
  public void testExecutionHasHistoricTestInstanceField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("historicTestInstance");
  }
  @Test
  public void testExecutionHasHistoricTestDefinitionField(){

    Assertions.assertThat(testExecution).hasFieldOrProperty("historicTestDefinition");
  }

}

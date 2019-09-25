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


package org.oran.otf.camunda.model;

import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.utility.gson.Convert;

import java.util.Map;

/**
 * @version 1.0 Synchronous workflow response bean
 */
public class WorkflowResponse {

  private String response;
  private String message;
  private String processInstanceId;
  private Map<String, String> variables;
  private TestExecution testExecution;
  private int messageCode;

  public String getResponse() {
    return response;
  }

  public void setResponse(String response) {
    this.response = response;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getProcessInstanceId() {
    return processInstanceId;
  }

  public void setProcessInstanceId(String pID) {
    this.processInstanceId = pID;
  }

  public Map<String, String> getVariables() {
    return variables;
  }

  public void setVariables(Map<String, String> variables) {
    this.variables = variables;
  }

  public int getMessageCode() {
    return messageCode;
  }

  public void setMessageCode(int messageCode) {
    this.messageCode = messageCode;
  }

  public TestExecution getTestExecution() {
    return testExecution;
  }

  public void setTestExecution(TestExecution testExecution) {
    this.testExecution = testExecution;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

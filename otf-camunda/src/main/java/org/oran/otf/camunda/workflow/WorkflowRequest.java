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


package org.oran.otf.camunda.workflow;

import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.utility.gson.Convert;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import java.io.Serializable;
import java.util.Map;
import org.bson.types.ObjectId;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkflowRequest implements Serializable {

  private static final long serialVersionUID = 1L;

  private boolean async = false;
  @JsonSerialize(using = ToStringSerializer.class)
  private ObjectId executorId = null;

  @JsonSerialize(using = ToStringSerializer.class)
  private ObjectId testInstanceId = null;

  private Map<String, ParallelFlowInput> pfloInput = null;
  private Map<String, Object> testData = null;
  private Map<String, Object> vthInput = null;
  private long maxExecutionTimeInMillis = 0L;

  public WorkflowRequest() throws Exception {
    //this.validate();
  }

  public WorkflowRequest(
      boolean async,
      String executorId,
      String testInstanceId,
      long maxExecutionTimeInMillis) {
    this.async = async;
    this.executorId = new ObjectId(executorId);
    this.testInstanceId = new ObjectId(testInstanceId);
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;
  }

  public WorkflowRequest(
      boolean async,
      ObjectId executorId,
      ObjectId testInstanceId,
      Map<String, ParallelFlowInput> pfloInput,
      Map<String, Object> testData,
      Map<String, Object> vthInput,
      int maxExecutionTimeInMillis)
      throws Exception {
    this.async = async;
    this.executorId = executorId;
    this.testInstanceId = testInstanceId;
    this.pfloInput = pfloInput;
    this.testData = testData;
    this.vthInput = vthInput;
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;

    this.validate();
  }

  @JsonCreator
  public WorkflowRequest(
      @JsonProperty(value = "async", required = false) boolean async,
      @JsonProperty(value = "executorId", required = true) String executorId,
      @JsonProperty(value = "testInstanceId", required = true) String testInstanceId,
      @JsonProperty(value = "pfloInput", required = false) Map<String, ParallelFlowInput> pfloInput,
      @JsonProperty(value = "testData", required = false) Map<String, Object> testData,
      @JsonProperty(value = "vthInput", required = false) Map<String, Object> vthInput,
      @JsonProperty(value = "maxExecutionTimeInMillis", required = false)
          int maxExecutionTimeInMillis) throws Exception {
    this.async = async;
    this.executorId = new ObjectId(executorId);
    this.testInstanceId = new ObjectId(testInstanceId);
    this.pfloInput = pfloInput;
    this.testData = testData;
    this.vthInput = vthInput;
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;

    this.validate();
  }

  private void validate() throws Exception {
    String missingFieldFormat = "Missing required field %s.";
//    if (this.executorId == null) {
//      throw new Exception(String.format(missingFieldFormat, "executorId"));
//    }

    if (this.testInstanceId == null) {
      throw new Exception(String.format(missingFieldFormat, "testInstanceId"));
    }

    if (this.maxExecutionTimeInMillis < 0L) {
      this.maxExecutionTimeInMillis = 0L;
    }
  }

  public boolean isAsync() {
    return async;
  }

  public void setAsync(boolean async) {
    this.async = async;
  }

  public ObjectId getExecutorId() {
    return executorId;
  }

  public void setExecutorId(ObjectId executorId) {
    this.executorId = executorId;
  }

  public ObjectId getTestInstanceId() {
    return testInstanceId;
  }

  public void setTestInstanceId(String testInstanceId) {
    this.testInstanceId = new ObjectId(testInstanceId);
  }

  public void setTestInstanceId(ObjectId testInstanceId) {
    this.testInstanceId = testInstanceId;
  }

  public Map<String, ParallelFlowInput> getPfloInput() {
    return pfloInput;
  }

  public void setPfloInput(Map<String, ParallelFlowInput> pfloInput) {
    this.pfloInput = pfloInput;
  }

  public Map<String, Object> getTestData() {
    return testData;
  }

  public void setTestData(Map<String, Object> testData) {
    this.testData = testData;
  }

  public Map<String, Object> getVthInput() {
    return vthInput;
  }

  public void setVthInput(Map<String, Object> vthInput) {
    this.vthInput = vthInput;
  }

  public long getMaxExecutionTimeInMillis() {
    return maxExecutionTimeInMillis;
  }

  public void setMaxExecutionTimeInMillis(long maxExecutionTimeInMillis) {
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

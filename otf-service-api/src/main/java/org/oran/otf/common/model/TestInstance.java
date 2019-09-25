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


package org.oran.otf.common.model;

import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "testInstances")
public class TestInstance implements Serializable {

  private static final long serialVersionUID = 1L;

  private @Id ObjectId _id;
  private String testInstanceName;
  private String testInstanceDescription;
  private ObjectId groupId;
  private ObjectId testDefinitionId;
  private String processDefinitionId;
  private boolean useLatestTestDefinition;
  private boolean disabled;
  private boolean simulationMode;
  private long maxExecutionTimeInMillis;
  private HashMap<String, ParallelFlowInput> pfloInput;
  private HashMap<String, Object> internalTestData;
  private HashMap<String, Object> simulationVthInput;
  private HashMap<String, Object> testData;
  private HashMap<String, Object> vthInput;
  private Date createdAt;
  private Date updatedAt;
  private ObjectId createdBy;
  private ObjectId updatedBy;

  public TestInstance() {}

  public TestInstance(
      ObjectId _id,
      String testInstanceName,
      String testInstanceDescription,
      ObjectId groupId,
      ObjectId testDefinitionId,
      String processDefinitionId,
      boolean useLatestTestDefinition,
      boolean disabled,
      boolean simulationMode,
      long maxExecutionTimeInMillis,
      HashMap<String, ParallelFlowInput> pfloInput,
      HashMap<String, Object> internalTestData,
      HashMap<String, Object> simulationVthInput,
      HashMap<String, Object> testData,
      HashMap<String, Object> vthInput,
      Date createdAt,
      Date updatedAt,
      ObjectId createdBy,
      ObjectId updatedBy) {
    this._id = _id;
    this.testInstanceName = testInstanceName;
    this.testInstanceDescription = testInstanceDescription;
    this.groupId = groupId;
    this.testDefinitionId = testDefinitionId;
    this.processDefinitionId = processDefinitionId;
    this.useLatestTestDefinition = useLatestTestDefinition;
    this.disabled = disabled;
    this.simulationMode = simulationMode;
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;
    this.pfloInput = pfloInput;
    this.internalTestData = internalTestData;
    this.simulationVthInput = simulationVthInput;
    this.testData = testData;
    this.vthInput = vthInput;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }

  public static long getSerialVersionUID() {
    return serialVersionUID;
  }

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public String getTestInstanceName() {
    return testInstanceName;
  }

  public void setTestInstanceName(String testInstanceName) {
    this.testInstanceName = testInstanceName;
  }

  public String getTestInstanceDescription() {
    return testInstanceDescription;
  }

  public void setTestInstanceDescription(String testInstanceDescription) {
    this.testInstanceDescription = testInstanceDescription;
  }

  public ObjectId getGroupId() {
    return groupId;
  }

  public void setGroupId(ObjectId groupId) {
    this.groupId = groupId;
  }

  public ObjectId getTestDefinitionId() {
    return testDefinitionId;
  }

  public void setTestDefinitionId(ObjectId testDefinitionId) {
    this.testDefinitionId = testDefinitionId;
  }

  public String getProcessDefinitionId() {
    return processDefinitionId;
  }

  public void setProcessDefinitionId(String processDefinitionId) {
    this.processDefinitionId = processDefinitionId;
  }

  public boolean isUseLatestTestDefinition() {
    return useLatestTestDefinition;
  }

  public void setUseLatestTestDefinition(boolean useLatestTestDefinition) {
    this.useLatestTestDefinition = useLatestTestDefinition;
  }

  public boolean isDisabled() {
    return disabled;
  }

  public void setDisabled(boolean disabled) {
    this.disabled = disabled;
  }

  public boolean isSimulationMode() {
    return simulationMode;
  }

  public void setSimulationMode(boolean simulationMode) {
    this.simulationMode = simulationMode;
  }

  public long getMaxExecutionTimeInMillis() {
    return maxExecutionTimeInMillis;
  }

  public void setMaxExecutionTimeInMillis(long maxExecutionTimeInMillis) {
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;
  }

  public HashMap<String, ParallelFlowInput> getPfloInput() {
    return pfloInput;
  }

  public void setPfloInput(HashMap<String, ParallelFlowInput> pfloInput) {
    this.pfloInput = pfloInput;
  }

  public HashMap<String, Object> getInternalTestData() {
    return internalTestData;
  }

  public void setInternalTestData(HashMap<String, Object> internalTestData) {
    this.internalTestData = internalTestData;
  }

  public HashMap<String, Object> getSimulationVthInput() {
    return simulationVthInput;
  }

  public void setSimulationVthInput(HashMap<String, Object> simulationVthInput) {
    this.simulationVthInput = simulationVthInput;
  }

  public HashMap<String, Object> getTestData() {
    return testData;
  }

  public void setTestData(HashMap<String, Object> testData) {
    this.testData = testData;
  }

  public HashMap<String, Object> getVthInput() {
    return vthInput;
  }

  public void setVthInput(HashMap<String, Object> vthInput) {
    this.vthInput = vthInput;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public Date getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt;
  }

  public ObjectId getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(ObjectId createdBy) {
    this.createdBy = createdBy;
  }

  public ObjectId getUpdatedBy() {
    return updatedBy;
  }

  public void setUpdatedBy(ObjectId updatedBy) {
    this.updatedBy = updatedBy;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

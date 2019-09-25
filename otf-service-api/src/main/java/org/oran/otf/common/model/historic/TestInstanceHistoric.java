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


package org.oran.otf.common.model.historic;

import org.oran.otf.common.model.TestInstance;
import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

public class TestInstanceHistoric implements Serializable {

  private static final long serialVersionUID = 1L;

  private @Id
  ObjectId _id;
  private String testInstanceName;
  private String testInstanceDescription;
  private ObjectId groupId;
  private ObjectId testDefinitionId;
  private String processDefinitionId;
  private Map<String, ParallelFlowInput> pfloInput;
  private Map<String, Object> simulationVthInput;
  private Map<String, Object> testData;
  private Map<String, Object> vthInput;
  private Date createdAt;
  private Date updatedAt;
  private ObjectId createdBy;
  private ObjectId updatedBy;
  private boolean simulationMode;

  public TestInstanceHistoric() {
  }

  public TestInstanceHistoric(TestInstance testInstance) {
    this._id = testInstance.get_id();
    this.testInstanceName = testInstance.getTestInstanceName();
    this.testInstanceDescription = testInstance.getTestInstanceDescription();
    this.groupId = testInstance.getGroupId();
    this.testDefinitionId = testInstance.getTestDefinitionId();
    this.pfloInput = testInstance.getPfloInput();
    this.processDefinitionId = testInstance.getProcessDefinitionId();
    this.simulationVthInput = testInstance.getSimulationVthInput();
    this.testData = testInstance.getTestData();
    this.vthInput = testInstance.getVthInput();
    this.createdAt = testInstance.getCreatedAt();
    this.updatedAt = testInstance.getUpdatedAt();
    this.createdBy = testInstance.getCreatedBy();
    this.updatedBy = testInstance.getUpdatedBy();
    this.simulationMode = testInstance.isSimulationMode();
  }

  public TestInstanceHistoric(
      ObjectId _id,
      String testInstanceName,
      String testInstanceDescription,
      ObjectId groupId,
      ObjectId testDefinitionId,
      String processDefinitionId,
      HashMap<String, ParallelFlowInput> pfloInput,
      HashMap<String, Object> simulationVthInput,
      HashMap<String, Object> testData,
      HashMap<String, Object> vthInput,
      Date createdAt,
      Date updatedAt,
      ObjectId createdBy,
      ObjectId updatedBy,
      boolean simulationMode) {
    this._id = _id;
    this.testInstanceName = testInstanceName;
    this.testInstanceDescription = testInstanceDescription;
    this.groupId = groupId;
    this.testDefinitionId = testDefinitionId;
    this.processDefinitionId = processDefinitionId;
    this.pfloInput = pfloInput;
    this.simulationVthInput = simulationVthInput;
    this.testData = testData;
    this.vthInput = vthInput;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.simulationMode = simulationMode;
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

  public Map<String, ParallelFlowInput> getPfloInput() {
    return pfloInput;
  }

  public void setPfloInput(
      HashMap<String, ParallelFlowInput> pfloInput) {
    this.pfloInput = pfloInput;
  }

  public Map<String, Object> getSimulationVthInput() {
    return simulationVthInput;
  }

  public void setSimulationVthInput(
      HashMap<String, Object> simulationVthInput) {
    this.simulationVthInput = simulationVthInput;
  }

  public Map<String, Object> getTestData() {
    return testData;
  }

  public void setTestData(HashMap<String, Object> testData) {
    this.testData = testData;
  }

  public Map<String, Object> getVthInput() {
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

  public boolean isSimulationMode() {
    return simulationMode;
  }

  public void setSimulationMode(boolean simulationMode) {
    this.simulationMode = simulationMode;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

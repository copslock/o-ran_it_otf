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

import org.oran.otf.common.model.TestDefinition;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.bson.types.ObjectId;

public class TestDefinitionHistoric implements Serializable {

  private static final long serialVersionUID = 1L;

  private ObjectId _id;
  private String testName;
  private String testDescription;
  private String processDefinitionKey;
  private List<BpmnInstance> bpmnInstances;
  private ObjectId groupId;
  private Date createdAt;
  private Date updatedAt;
  private ObjectId createdBy;
  private ObjectId updatedBy;

  public TestDefinitionHistoric() {
  }

  public TestDefinitionHistoric(TestDefinition testDefinition, String processDefinitionId) {
    this._id = testDefinition.get_id();
    this.testName = testDefinition.getTestName();
    this.testDescription = testDefinition.getTestDescription();
    this.processDefinitionKey = testDefinition.getProcessDefinitionKey();
    this.bpmnInstances =
        getHistoricBpmnInstanceAsList(testDefinition.getBpmnInstances(), processDefinitionId);
    this.groupId = testDefinition.getGroupId();
    this.createdAt = testDefinition.getCreatedAt();
    this.updatedAt = testDefinition.getUpdatedAt();
    this.createdBy = testDefinition.getCreatedBy();
    this.updatedBy = testDefinition.getUpdatedBy();
  }

  public TestDefinitionHistoric(
      ObjectId _id,
      String testName,
      String testDescription,
      String processDefinitionKey,
      List<BpmnInstance> bpmnInstances,
      ObjectId groupId,
      Date createdAt,
      Date updatedAt,
      ObjectId createdBy,
      ObjectId updatedBy) {
    this._id = _id;
    this.testName = testName;
    this.testDescription = testDescription;
    this.processDefinitionKey = processDefinitionKey;
    this.bpmnInstances = bpmnInstances;
    this.groupId = groupId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }

  private List<BpmnInstance> getHistoricBpmnInstanceAsList(
      List<BpmnInstance> bpmnInstances, String processDefinitionId) {
    BpmnInstance bpmnInstance =
        bpmnInstances.stream()
            .filter(
                _bpmnInstance -> {
                  return _bpmnInstance.isDeployed()
                      && _bpmnInstance.getProcessDefinitionId() != null
                      && _bpmnInstance.getProcessDefinitionId().equals(processDefinitionId);
                })
            .findFirst()
            .orElse(null);

    List<BpmnInstance> historicBpmnInstance = new ArrayList<>();
    if (bpmnInstance != null) {
      historicBpmnInstance.add(bpmnInstance);
    }

    return historicBpmnInstance;
  }

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public String getTestName() {
    return testName;
  }

  public void setTestName(String testName) {
    this.testName = testName;
  }

  public String getTestDescription() {
    return testDescription;
  }

  public void setTestDescription(String testDescription) {
    this.testDescription = testDescription;
  }

  public String getProcessDefinitionKey() {
    return processDefinitionKey;
  }

  public void setProcessDefinitionKey(String processDefinitionKey) {
    this.processDefinitionKey = processDefinitionKey;
  }

  public List<BpmnInstance> getBpmnInstances() {
    return bpmnInstances;
  }

  public void setBpmnInstances(List<BpmnInstance> bpmnInstances) {
    this.bpmnInstances = bpmnInstances;
  }

  public ObjectId getGroupId() {
    return groupId;
  }

  public void setGroupId(ObjectId groupId) {
    this.groupId = groupId;
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

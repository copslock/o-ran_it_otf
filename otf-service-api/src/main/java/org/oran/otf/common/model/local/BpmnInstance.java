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


package org.oran.otf.common.model.local;

import org.oran.otf.common.utility.gson.Convert;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.bson.types.ObjectId;

public class BpmnInstance implements Serializable {

  private static final long serialVersionUID = 1L;

  private String processDefinitionId;
  private String deploymentId;
  private int version;
  private ObjectId bpmnFileId;
  private ObjectId resourceFileId;
  private boolean isDeployed;
  private List<TestHeadNode> testHeads;
  private List<PfloNode> pflos;
  private Map<String, Object> testDataTemplate;
  private Date createdAt;
  private Date updatedAt;
  private ObjectId createdBy;
  private ObjectId updatedBy;

  public BpmnInstance() {
  }

  @JsonCreator
  public BpmnInstance(
      @JsonProperty("processDefinitionId") String processDefinitionId,
      @JsonProperty("deploymentId") String deploymentId,
      @JsonProperty("version") int version,
      @JsonProperty("bpmnFileId") ObjectId bpmnFileId,
      @JsonProperty("resourceFileId") ObjectId resourceFileId,
      @JsonProperty("isDeployed") boolean isDeployed,
      @JsonProperty("testHeads") List<TestHeadNode> testHeads,
      @JsonProperty("plfos") List<PfloNode> pflos,
      @JsonProperty("testDataTemplate") Map<String, Object> testDataTemplate,
      @JsonProperty("createdAt") Date createdAt,
      @JsonProperty("updateAt") Date updatedAt,
      @JsonProperty("createdBy") ObjectId createdBy,
      @JsonProperty("updatedBy") ObjectId updatedBy) {
    this.processDefinitionId = processDefinitionId;
    this.deploymentId = deploymentId;
    this.version = version;
    this.bpmnFileId = bpmnFileId;
    this.resourceFileId = resourceFileId;
    this.isDeployed = isDeployed;
    this.testHeads = testHeads;
    this.testDataTemplate = testDataTemplate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }

  public String getProcessDefinitionId() {
    return processDefinitionId;
  }

  public void setProcessDefinitionId(String processDefinitionId) {
    this.processDefinitionId = processDefinitionId;
  }

  public String getDeploymentId() {
    return deploymentId;
  }

  public void setDeploymentId(String deploymentId) {
    this.deploymentId = deploymentId;
  }

  public int getVersion() {
    return version;
  }

  public void setVersion(int version) {
    this.version = version;
  }

  public ObjectId getBpmnFileId() {
    return bpmnFileId;
  }

  public void setBpmnFileId(ObjectId bpmnFileId) {
    this.bpmnFileId = bpmnFileId;
  }

  public ObjectId getResourceFileId() {
    return resourceFileId;
  }

  public void setResourceFileId(ObjectId resourceFileId) {
    this.resourceFileId = resourceFileId;
  }

  @JsonProperty(value="isDeployed")
  public boolean isDeployed() {
    return isDeployed;
  }

  public void setDeployed(boolean deployed) {
    isDeployed = deployed;
  }

  public List<TestHeadNode> getTestHeads() {
    return testHeads;
  }

  public void setTestHeads(List<TestHeadNode> testHeads) {
    this.testHeads = testHeads;
  }

  public List<PfloNode> getPflos() {
    return pflos;
  }

  public void setPflos(List<PfloNode> pflos) {
    this.pflos = pflos;
  }

  public Map<String, Object> getTestDataTemplate() {
    return testDataTemplate;
  }

  public void setTestDataTemplate(Map<String, Object> testDataTemplate) {
    this.testDataTemplate = testDataTemplate;
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

  private String getObjectIdString(ObjectId value) {
    return value == null ? "\"\"" : "\"" + value.toString() + "\"";
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

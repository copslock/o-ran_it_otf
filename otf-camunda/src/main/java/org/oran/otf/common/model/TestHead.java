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

import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "testHeads")
public class TestHead implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  private ObjectId _id;

  @Indexed(unique = true)
  private String testHeadName;

  private String testHeadDescription;
  private String hostname;
  private String port;
  private String resourcePath;
  private ObjectId creatorId;
  private ObjectId groupId;
  private String authorizationType;
  private String authorizationCredential;
  private Boolean authorizationEnabled;
  private Map<String, Object> vthInputTemplate;
  private Date createdAt;
  private Date updatedAt;
  private ObjectId updatedBy;
  private Boolean isPublic;
  public TestHead() {
  }

  public TestHead(
          ObjectId _id,
          String testHeadName,
          String testHeadDescription,
          String hostname,
          String port,
          String resourcePath,
          ObjectId creatorId,
          ObjectId groupId,
          String authorizationType,
          String authorizationCredential,
          boolean authorizationEnabled,
          Map<String, Object> vthInputTemplate,
          Date createdAt,
          Date updatedAt,
          ObjectId updatedBy,
          Boolean isPublic) {
    this._id = _id;
    this.testHeadName = testHeadName;
    this.testHeadDescription = testHeadDescription;
    this.hostname = hostname;
    this.port = port;
    this.resourcePath = resourcePath;
    this.creatorId = creatorId;
    this.groupId = groupId;
    this.authorizationType = authorizationType;
    this.authorizationCredential = authorizationCredential;
    this.authorizationEnabled = authorizationEnabled;
    this.vthInputTemplate = vthInputTemplate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
    this.isPublic = isPublic;
  }

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public String getTestHeadName() {
    return testHeadName;
  }

  public void setTestHeadName(String testHeadName) {
    this.testHeadName = testHeadName;
  }

  public String getTestHeadDescription() {
    return testHeadDescription;
  }

  public void setTestHeadDescription(String testHeadDescription) {
    this.testHeadDescription = testHeadDescription;
  }

  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public String getPort() {
    return port;
  }

  public void setPort(String port) {
    this.port = port;
  }

  public String getResourcePath() {
    return resourcePath;
  }

  public void setResourcePath(String resourcePath) {
    this.resourcePath = resourcePath;
  }

  public ObjectId getCreatorId() {
    return creatorId;
  }

  public void setCreatorId(ObjectId creatorId) {
    this.creatorId = creatorId;
  }

  public ObjectId getGroupId() {
    return groupId;
  }

  public void setGroupId(ObjectId groupId) {
    this.groupId = groupId;
  }

  public String getAuthorizationCredential() {
    return authorizationCredential;
  }

  public String getAuthorizationType() {
    return authorizationType;
  }

  public void setAuthorizationType(String authorizationType) {
    this.authorizationType = authorizationType;
  }

  public void setAuthorizationCredential(String authorizationCredential) {
    this.authorizationCredential = authorizationCredential;
  }

  public Boolean getAuthorizationEnabled() {
    return authorizationEnabled;
  }

  public void setAuthorizationEnabled(Boolean authorizationEnabled) {
    this.authorizationEnabled = authorizationEnabled;
  }

  public Map<String, Object> getVthInputTemplate() {
    return vthInputTemplate;
  }

  public void setVthInputTemplate(Map<String, Object> vthInputTemplate) {
    this.vthInputTemplate = vthInputTemplate;
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

  public ObjectId getUpdatedBy() {
    return updatedBy;
  }

  public void setUpdatedBy(ObjectId updatedBy) {
    this.updatedBy = updatedBy;
  }

  public Boolean isPublic() {
    return isPublic;
  }

  public void setPublic(Boolean aPublic) {
    isPublic = aPublic;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

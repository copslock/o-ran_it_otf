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
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "groups")
public class Group implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  private ObjectId _id;
  private String groupName;
  private String groupDescription;
  private List<ObjectId> mechanizedIds;
  private ObjectId ownerId;
  private List<Role> roles;
  private List<GroupMember> members;
  private ObjectId parentGroupId;

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public String getGroupName() {
    return groupName;
  }

  public void setGroupName(String groupName) {
    this.groupName = groupName;
  }

  public String getGroupDescription() {
    return groupDescription;
  }

  public void setGroupDescription(String groupDescription) {
    this.groupDescription = groupDescription;
  }

  public List<ObjectId> getMechanizedIds() {
    return mechanizedIds;
  }

  public void setMechanizedIds(List<ObjectId> mechanizedIds) {
    this.mechanizedIds = mechanizedIds;
  }

  public ObjectId getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(ObjectId ownerId) {
    this.ownerId = ownerId;
  }

  public List<Role> getRoles() {
    return roles;
  }

  public void setRoles(List<Role> roles) {
    this.roles = roles;
  }

    public List<GroupMember> getMembers() {
    return members;
  }

  public void setMembers(List<GroupMember> members) {
    this.members = members;
  }

  public ObjectId getParentGroupId() {
    return parentGroupId;
  }

  public void setParentGroupId(ObjectId parentGroupId) {
    this.parentGroupId = parentGroupId;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

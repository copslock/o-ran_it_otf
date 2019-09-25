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

import org.oran.otf.common.model.local.UserGroup;
import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User implements Serializable {

  private static final long serialVersionUID = 1L;

  private ObjectId _id;
  private List<String> permissions;
  private String firstName;
  private String lastName;
  private String email;
  private String password;
  private List<UserGroup> groups;
  private Date createdAt;
  private Date updatedAt;

  public User(
      ObjectId _id,
      List<String> permissions,
      String firstName,
      String lastName,
      String email,
      String password,
      List<UserGroup> groups,
      Date createdAt,
      Date updatedAt) {
    this._id = _id;
    this.permissions = permissions;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.groups = groups;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public List<String> getPermissions() {
    return permissions;
  }

  public void setPermissions(List<String> permissions) {
    this.permissions = permissions;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public List<UserGroup> getGroups() {
    return groups;
  }

  public void setGroups(List<UserGroup> groups) {
    this.groups = groups;
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

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

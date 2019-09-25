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

import org.bson.types.ObjectId;

public class DeployTestStrategyRequest {
  private ObjectId testDefinitionDeployerId;
  private ObjectId testDefinitionId;
  private String definitionId;

  public DeployTestStrategyRequest() {}

  public DeployTestStrategyRequest(
      ObjectId testDefinitionDeployerId, ObjectId testDefinitionId, String definitionId) {
    this.testDefinitionDeployerId = testDefinitionDeployerId;
    this.testDefinitionId = testDefinitionId;
    this.definitionId = definitionId;
  }

  public ObjectId getTestDefinitionDeployerId() {
    return testDefinitionDeployerId;
  }

  public void setTestDefinitionDeployerId(ObjectId testDefinitionDeployerId) {
    this.testDefinitionDeployerId = testDefinitionDeployerId;
  }

  public ObjectId getTestDefinitionId() {
    return testDefinitionId;
  }

  public void setTestDefinitionId(ObjectId testDefinitionId) {
    this.testDefinitionId = testDefinitionId;
  }

  public String getDefinitionId() {
    return definitionId;
  }

  public void setDefinitionId(String definitionId) {
    this.definitionId = definitionId;
  }

  @Override
  public String toString() {
    return "{\"DeployTestStrategyRequest\":{"
        + "\"testDefinitionDeployerId\":\""
        + testDefinitionDeployerId
        + "\""
        + ", \"testDefinitionId\":\""
        + testDefinitionId
        + "\""
        + ", \"definitionId\":\""
        + definitionId
        + "\""
        + "}}";
  }
}

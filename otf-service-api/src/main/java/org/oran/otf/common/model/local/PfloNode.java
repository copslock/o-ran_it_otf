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

import java.io.Serializable;

public class PfloNode implements Serializable {

  private static final long serialVersionUID = 1L;

  private String bpmnPlfoTaskId;
  private String label;

  public PfloNode() {}

  public PfloNode(String bpmnPlfoTaskId, String label) {
    this.bpmnPlfoTaskId = bpmnPlfoTaskId;
    this.label = label;
  }

  public static long getSerialVersionUID() {
    return serialVersionUID;
  }

  public String getBpmnPlfoTaskId() {
    return bpmnPlfoTaskId;
  }

  public void setBpmnPlfoTaskId(String bpmnPlfoTaskId) {
    this.bpmnPlfoTaskId = bpmnPlfoTaskId;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

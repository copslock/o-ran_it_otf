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
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;

public class TestHeadResult implements Serializable {

  private static final long serialVersionUID = 1L;

  private ObjectId testHeadId;
  private String testHeadName;
  private ObjectId testHeadGroupId;
  private String bpmnVthTaskId;

  //TODO: RG Remove maps below, setters and getters to return to normal
  //private Map<String, String> testHeadHeaders;
  //private int testHeadCode;
  private int statusCode;

  private TestHeadRequest testHeadRequest;
  private Map<String, Object> testHeadResponse;
  private Date startTime;
  private Date endTime;

  public TestHeadResult() {
  }

  public TestHeadResult(
      ObjectId testHeadId,
      String testHeadName,
      ObjectId testHeadGroupId,
      String bpmnVthTaskId,

      //TODO: RG changed code to int and changed testHeadRequest from Map<String, String> to RequestContent
      int statusCode,

      TestHeadRequest testHeadRequest,
      Map<String, Object> testHeadResponse,
      Date startTime,
      Date endTime) {
    this.testHeadId = testHeadId;
    this.testHeadName = testHeadName;
    this.testHeadGroupId = testHeadGroupId;
    this.bpmnVthTaskId = bpmnVthTaskId;

    //this.testHeadHeaders = testHeadHeaders;
    this.statusCode = statusCode;

    this.testHeadRequest = testHeadRequest;
    this.testHeadResponse = testHeadResponse;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  public int getStatusCode(){return statusCode;}
  public void setStatusCode(int testHeadCode){this.statusCode = statusCode;}

  public ObjectId getTestHeadId() {
    return testHeadId;
  }

  public void setTestHeadId(ObjectId testHeadId) {
    this.testHeadId = testHeadId;
  }

  public String getTestHeadName() {
    return testHeadName;
  }

  public void setTestHeadName(String testHeadName) {
    this.testHeadName = testHeadName;
  }

  public ObjectId getTestHeadGroupId() {
    return testHeadGroupId;
  }

  public void setTestHeadGroupId(ObjectId testHeadGroupId) {
    this.testHeadGroupId = testHeadGroupId;
  }

  public String getBpmnVthTaskId() {
    return bpmnVthTaskId;
  }

  public void setBpmnVthTaskId(String bpmnVthTaskId) {
    this.bpmnVthTaskId = bpmnVthTaskId;
  }

  public TestHeadRequest getTestHeadRequest() {
    return testHeadRequest;
  }

  public void setTestHeadRequest(TestHeadRequest testHeadRequest) {
    this.testHeadRequest = testHeadRequest;
  }

  public Map<String, Object> getTestHeadResponse() {
    return testHeadResponse;
  }

  public void setTestHeadResponse(Map<String, Object> testHeadResponse) {
    this.testHeadResponse = testHeadResponse;
  }

  public Date getStartTime() {
    return startTime;
  }

  public void setStartTime(Date startTime) {
    this.startTime = startTime;
  }

  public Date getEndTime() {
    return endTime;
  }

  public void setEndTime(Date endTime) {
    this.endTime = endTime;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

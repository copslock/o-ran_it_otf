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

import org.oran.otf.common.model.historic.TestDefinitionHistoric;
import org.oran.otf.common.model.historic.TestInstanceHistoric;
import org.oran.otf.common.model.local.TestHeadResult;
import org.oran.otf.common.utility.gson.Convert;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "testExecutions")
public class TestExecution implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  private ObjectId _id;
  private ObjectId groupId;
  private ObjectId executorId;

  private boolean async;
  private Date startTime;
  private Date endTime;
  private String asyncTopic;
  private String businessKey;
  private String processInstanceId;
  private String testResult;
  private String testResultMessage;
  private Map<String, Object> testDetails;
  private List<TestHeadResult> testHeadResults;
  private List<TestExecution> testInstanceResults;
  // Stores historic information of associated
  private String historicEmail;
  private TestInstanceHistoric historicTestInstance;
  private TestDefinitionHistoric historicTestDefinition;

  public TestExecution() {
  }

  public TestExecution(
          ObjectId _id,
          ObjectId groupId,
          ObjectId executorId,
          boolean async,
          Date startTime,
          Date endTime,
          String asyncTopic,
          String businessKey,
          String processInstanceId,
          String testResult,
          String testResultMessage,
          Map<String, Object> testDetails,
          List<TestHeadResult> testHeadResults,
          List<TestExecution> testInstanceResults,
          String historicEmail,
          TestInstanceHistoric historicTestInstance,
          TestDefinitionHistoric historicTestDefinition) {
    this._id = _id;
    this.groupId = groupId;
    this.executorId = executorId;
    this.async = async;
    this.startTime = startTime;
    this.endTime = endTime;
    this.asyncTopic = asyncTopic;
    this.businessKey = businessKey;
    this.processInstanceId = processInstanceId;
    this.testResult = testResult;
    this.testDetails = testDetails;
    this.testHeadResults = testHeadResults;
    this.testInstanceResults = testInstanceResults;
    this.historicEmail = historicEmail;
    this.historicTestInstance = historicTestInstance;
    this.historicTestDefinition = historicTestDefinition;
  }

  public ObjectId get_id() {
    return _id;
  }

  public void set_id(ObjectId _id) {
    this._id = _id;
  }

  public ObjectId getGroupId() {
    return groupId;
  }

  public void setGroupId(ObjectId groupId) {
    this.groupId = groupId;
  }

  public ObjectId getExecutorId() {
    return executorId;
  }

  public void setExecutorId(ObjectId executorId) {
    this.executorId = executorId;
  }

  public boolean isAsync() {
    return async;
  }

  public void setAsync(boolean async) {
    this.async = async;
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

  public String getAsyncTopic() {
    return asyncTopic;
  }

  public void setAsyncTopic(String asyncTopic) {
    this.asyncTopic = asyncTopic;
  }

  public String getBusinessKey() {
    return businessKey;
  }

  public void setBusinessKey(String businessKey) {
    this.businessKey = businessKey;
  }

  public String getProcessInstanceId() {
    return processInstanceId;
  }

  public void setProcessInstanceId(String processInstanceId) {
    this.processInstanceId = processInstanceId;
  }

  public String getTestResult() {
    return testResult;
  }

  public void setTestResult(String testResult) {
    this.testResult = testResult;
  }

  public String getTestResultMessage() {
    return testResultMessage;
  }

  public void setTestResultMessage(String testResultMessage) {
    this.testResultMessage = testResultMessage;
  }

  public Map<String, Object> getTestDetails() {
    return testDetails;
  }

  public void setTestDetails(Map<String, Object> testDetails) {
    this.testDetails = testDetails;
  }

  public List<TestHeadResult> getTestHeadResults() {
    synchronized (testHeadResults) {
      return testHeadResults;
    }
  }

  public void setTestHeadResults(List<TestHeadResult> testHeadResults) {
    synchronized (testHeadResults) {
      this.testHeadResults = testHeadResults;
    }
  }

  public List<TestExecution> getTestInstanceResults() {
    synchronized (testInstanceResults) {
      return testInstanceResults;
    }
  }

  public void setTestInstanceResults(List<TestExecution> testInstanceResults) {
    synchronized (testInstanceResults) {
      this.testInstanceResults = testInstanceResults;
    }
  }

  public String getHistoricEmail() {
    return historicEmail;
  }

  public void setHistoricEmail(String historicEmail) {
    this.historicEmail = historicEmail;
  }

  public TestInstanceHistoric getHistoricTestInstance() {
    return historicTestInstance;
  }

  public void setHistoricTestInstance(TestInstanceHistoric historicTestInstance) {
    this.historicTestInstance = historicTestInstance;
  }

  public TestDefinitionHistoric getHistoricTestDefinition() {
    return historicTestDefinition;
  }

  public void setHistoricTestDefinition(
          TestDefinitionHistoric historicTestDefinition) {
    this.historicTestDefinition = historicTestDefinition;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

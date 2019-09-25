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
import com.google.common.base.Strings;
import java.io.Serializable;
import java.util.HashMap;
import org.bson.types.ObjectId;

public class TestInstanceCreateRequest implements Serializable {
  private static final long serialVersionUID = 1L;

  private ObjectId testDefinitionId = null;
  private int version = Integer.MIN_VALUE;
  private String processDefinitionKey = null;

  private String testInstanceName;
  private String testInstanceDescription;
  private HashMap<String, ParallelFlowInput> pfloInput;
  private HashMap<String, Object> simulationVthInput;
  private HashMap<String, Object> testData;
  private HashMap<String, Object> vthInput;
  private ObjectId createdBy;
  private boolean useLatestTestDefinition = true;
  private boolean simulationMode = false;
  private long maxExecutionTimeInMillis = 0L;

  public TestInstanceCreateRequest() throws Exception {
    this.validate();
  }

  public TestInstanceCreateRequest(
      String testInstanceName,
      String testInstanceDescription,
      HashMap<String, ParallelFlowInput> pfloInput,
      HashMap<String, Object> simulationVthInput,
      HashMap<String, Object> testData,
      HashMap<String, Object> vthInput,
      ObjectId createdBy,
      boolean useLatestTestDefinition,
      boolean simulationMode,
      long maxExecutionTimeInMillis) throws Exception {
    this.testInstanceName = testInstanceName;
    this.testInstanceDescription = testInstanceDescription;
    this.pfloInput = pfloInput;
    this.simulationVthInput = simulationVthInput;
    this.testData = testData;
    this.vthInput = vthInput;
    this.createdBy = createdBy;
    this.useLatestTestDefinition = useLatestTestDefinition;
    this.simulationMode = simulationMode;
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;

    this.validate();
  }

  private void validate() throws Exception {
    String missingFieldFormat = "The field %s is required.";
    if (Strings.isNullOrEmpty(testInstanceName)) {
      throw new Exception(String.format(missingFieldFormat, "testInstanceName"));
    }

    if (Strings.isNullOrEmpty(testInstanceDescription)) {
      throw new Exception(String.format(missingFieldFormat, "testInstanceDescription"));
    }

    if (pfloInput == null) {
      pfloInput = new HashMap<>();
    }

    if (simulationVthInput == null) {
      simulationVthInput = new HashMap<>();
    }

    if (testData == null) {
      testData = new HashMap<>();
    }

    if (vthInput == null) {
      vthInput = new HashMap<>();
    }

    if (this.maxExecutionTimeInMillis < 0L) {
      this.maxExecutionTimeInMillis = 0L;
    }
  }

  public static long getSerialVersionUID() {
    return serialVersionUID;
  }

  public ObjectId getTestDefinitionId() {
    return testDefinitionId;
  }

  public void setTestDefinitionId(ObjectId testDefinitionId) {
    this.testDefinitionId = testDefinitionId;
  }

  public int getVersion() {
    return version;
  }

  public void setVersion(int version) {
    this.version = version;
  }

  public String getProcessDefinitionKey() {
    return processDefinitionKey;
  }

  public void setProcessDefinitionKey(String processDefinitionKey) {
    this.processDefinitionKey = processDefinitionKey;
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

  public HashMap<String, ParallelFlowInput> getPfloInput() {
    return pfloInput;
  }

  public void setPfloInput(HashMap<String, ParallelFlowInput> pfloInput) {
    this.pfloInput = pfloInput;
  }

  public HashMap<String, Object> getSimulationVthInput() {
    return simulationVthInput;
  }

  public void setSimulationVthInput(HashMap<String, Object> simulationVthInput) {
    this.simulationVthInput = simulationVthInput;
  }

  public HashMap<String, Object> getTestData() {
    return testData;
  }

  public void setTestData(HashMap<String, Object> testData) {
    this.testData = testData;
  }

  public HashMap<String, Object> getVthInput() {
    return vthInput;
  }

  public void setVthInput(HashMap<String, Object> vthInput) {
    this.vthInput = vthInput;
  }

  public ObjectId getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(ObjectId createdBy) {
    this.createdBy = createdBy;
  }

  public boolean isUseLatestTestDefinition() {
    return useLatestTestDefinition;
  }

  public void setUseLatestTestDefinition(boolean useLatestTestDefinition) {
    this.useLatestTestDefinition = useLatestTestDefinition;
  }

  public boolean isSimulationMode() {
    return simulationMode;
  }

  public void setSimulationMode(boolean simulationMode) {
    this.simulationMode = simulationMode;
  }

  public long getMaxExecutionTimeInMillis() {
    return maxExecutionTimeInMillis;
  }

  public void setMaxExecutionTimeInMillis(long maxExecutionTimeInMillis) {
    this.maxExecutionTimeInMillis = maxExecutionTimeInMillis;
  }

  @Override
  public String toString() {
    return Convert.objectToJson(this);
  }
}

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


package org.oran.otf.camunda.workflow.utility;

import static org.camunda.spin.Spin.JSON;

import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.oran.otf.camunda.model.ExecutionConstants.ExecutionVariable;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.local.ParallelFlowInput;
import org.oran.otf.common.utility.Utility;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.bson.types.ObjectId;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.spin.json.SpinJsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkflowUtility {

  private static Logger logger = LoggerFactory.getLogger(WorkflowUtility.class);
  @Autowired
  private RsaEncryptDecrypt rsaUtility;

  public boolean verifyTestExecutionChecksum(
      DelegateExecution execution, TestExecution testExecution) {
    try {
      byte[] enc = (byte[]) execution.getVariable(ExecutionVariable.TEST_EXECUTION);

      String test = ""; // testExecution.createTestDescription();
      String dec = new String(rsaUtility.decrypt(enc));
      if (!dec.equals(test)) {
        return false;
        // throw new TestExecutionException("Modification Error: User modified platform data");
      }
    } catch (Exception e) {
      logger.error(
          execution.getCurrentActivityId()
              + ": Failed to decrypt test execution. May have been tampered with.\n"
              + e.getMessage());
      return false;
    }
    return true;
  }

  public <T> T getExecutionVariable(Map<String, Object> variables, String key, Class<T> type) {
    Object obj = variables.get(key);
    if (obj == null) {
      logger.error(String.format("Failed to get variable because the key %s does not exist.", key));
    }
    // return spin json nodes as maps
    if (obj instanceof SpinJsonNode) {
      SpinJsonNode node = (SpinJsonNode) obj;
      if (!node.isObject()) {
        throw new TestExecutionException(
            "Unable to retrieve variable as type Map from the execution. Variable was set to SpinJsonNode");
      }
      Map<String, Object> map = (Map<String, Object>) node.mapTo(HashMap.class);
    }

    return type.isInstance(obj) ? type.cast(obj) : null;
  }

//  public boolean hasPermission(User user, TestInstance testInstance) {
//    // Groups that the user holds a membership in.
//    List<UserGroup> userGroups = user.getGroups();
//    // The groupId associated with the test instance.
//    ObjectId targetGroupId = testInstance.getGroupId();
//    // Check if any of the groups has access to the test instance.
//    UserGroup targetGroup =
//        userGroups.stream()
//            .filter(userGroup -> userGroup.getGroupId().equals(targetGroupId))
//            .findAny()
//            .orElse(null);
//
//    return targetGroup != null;
//  }

  public TestExecution getTestExecution(Map<String, Object> variables, String logPrefix)
      throws TestExecutionException {
    // Get the current test execution object.
    TestExecution testExecution =
        this.getExecutionVariable(variables, ExecutionVariable.TEST_EXECUTION, TestExecution.class);
    // Perform a null-check to ensure it is available. It's critical to throw an exception if it
    // is not available since the object is essential for results.
    if (testExecution == null) {
      logger.error(logPrefix + " Test execution is null.");
      throw new TestExecutionException("The test execution was not found.");
    }
    return testExecution;
  }

  public Map<String, Object> getTestData(Map<String, Object> variables, String logPrefix)
      throws TestExecutionException {
    // Get vthInput from the Camunda execution variable map.
    @SuppressWarnings({"unchecked"})
    Map<String, Object> testData =
        (Map<String, Object>)
            this.getExecutionVariable(variables, ExecutionVariable.TEST_DATA, Map.class);

    if (testData == null) {
      throw new TestExecutionException(
          "Unable to retrieve testData as type Map from the execution.");
    }
    return testData;
  }

  public Object getTestDataByActivity(
      Map<String, Object> variables, String currentActivityId, String logPrefix)
      throws TestExecutionException, NullPointerException {
    // Get vthInput from the Camunda execution variable map.
    @SuppressWarnings({"unchecked"})
    Map<String, Object> testData =
        (Map<String, Object>)
            this.getExecutionVariable(variables, ExecutionVariable.TEST_DATA, Map.class);

    if (testData == null) {
      throw new TestExecutionException(
          "Unable to retrieve testData as type Map from the execution.");
    }
    Object activityParameters = testData.get(currentActivityId);
    if (activityParameters == null) {
      throw new NullPointerException(
          logPrefix
              + String.format(
              "A testData parameter was not found for the activityId, %s.", currentActivityId));
    }
    return activityParameters;
  }


  public Map<String, ParallelFlowInput> getPfloInputByActivity(
      Map<String, Object> variables, String currentActivityId, String logPrefix)
      throws TestExecutionException, NullPointerException {
    // Get vthInput from the Camunda execution variable map.
    @SuppressWarnings({"unchecked"})
    Map<String, Object> pfloInput =
        (Map<String, Object>)
            this.getExecutionVariable(variables, ExecutionVariable.PFLO_INPUT, Map.class);

    if (pfloInput == null) {
      throw new TestExecutionException(
          "Unable to retrieve testData as type Map from the execution.");
    }
    Map<String, ParallelFlowInput> activityParameters =
        (Map<String, ParallelFlowInput>) pfloInput.get(currentActivityId);
    if (activityParameters == null) {
      throw new NullPointerException(
          logPrefix
              + String.format(
              "A plfoInput parameter was not found for the activityId, %s.",
              currentActivityId));
    }
    return activityParameters;
  }

  public List<Map<String, Object>> getVthInput(
      Map<String, Object> variables, String currentActivityId, String logPrefix)
      throws TestExecutionException, NullPointerException, IllegalArgumentException {
    // Get vthInput from the Camunda execution variable map.
    @SuppressWarnings({"unchecked"})
    Map<String, Object> vthInput =
        (Map<String, Object>)
            this.getExecutionVariable(variables, ExecutionVariable.VTH_INPUT, Map.class);

    if (vthInput == null) {
      throw new TestExecutionException(
          "Unable to retrieve vthInput as type Map from the execution.");
    }

    // Get the current activityId to use as a key to retrieve the vthInput for this task.
    // vthInput is expected to be a JSON array of size [1, inf)
    Object oActivityParameters = vthInput.get(currentActivityId);
    // Throw an exception if no parameters were found for this activity.
    if (oActivityParameters == null) {
      throw new NullPointerException(
          logPrefix
              + String.format(
              "A vthInput parameter was not found for the activityId, %s.", currentActivityId));
    }

    List<Map<String, Object>> lActivityParameters;
    // Legacy hack
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> mActivityParameters = new HashMap<>();
      mActivityParameters.put("method", "post");
      mActivityParameters.put("payload", Utility.toMap(oActivityParameters));
      Map<String, Object> headers = new HashMap<>();
      headers.put("Content-Type", "application/json");
      mActivityParameters.put("headers", headers);
      lActivityParameters = new ArrayList();
      lActivityParameters.add(mActivityParameters);
    } catch (Exception e) {
      try {
        // Try to convert the parameters to an array of "vthInput(s)"
        lActivityParameters = (List<Map<String, Object>>) Utility.toList(oActivityParameters);
      } catch (Exception ee) {
        throw new IllegalArgumentException(
            String.format("Unable to parse the value for vthInput[%s].", currentActivityId));
      }
    }
    return lActivityParameters;
  }

  public String getTestResult(Map<String, Object> variables, String logPrefix) {
    String testResult =
        this.getExecutionVariable(variables, ExecutionVariable.TEST_RESULT, String.class);
    // Set the test result to UNKNOWN
    if (testResult == null) {
      logger.debug(
          logPrefix
              + "Unable to retrieve test result as primitive type String. Setting result to unknown.");
      testResult = ExecutionConstants.TestResult.UNKNOWN;
    }
    return testResult;
  }

  public String getTestResultMessage(Map<String, Object> variables, String logPrefix) {
    String testResultMessage =
            this.getExecutionVariable(variables, ExecutionVariable.TEST_RESULT_MESSAGE, String.class);
    // Set the test result to UNKNOWN
    if (testResultMessage == null) {
      testResultMessage = "";
//      logger.debug(
//              logPrefix
//                      + "Unable to retrieve test result message as primitive type String. Setting message to empty string.");
//      testResultMessage = "";
    }
    return testResultMessage;
  }

  public Map<String, Object> getTestDetails(Map<String, Object> variables, String logPrefix)
      throws TestExecutionException {
    // Get test details as a String because it can be saved as one of many "JSON" types. Then try
    // to convert it to a generic map.
    String testDetailsString =
        this.getExecutionVariable(variables, ExecutionVariable.TEST_DETAILS, String.class);
    if (testDetailsString != null) {
      // Use Spin to map the string to a Map.
      @SuppressWarnings({"unchecked"})
      Map<String, Object> mTestDetails;
      try {
        mTestDetails = JSON(testDetailsString).mapTo(HashMap.class);
      } catch (Exception e) {
        logger.error(
            "Unable to convert testDetails to a map.\nError: "
                + e.getMessage()
                + "\ntestDetails: "
                + testDetailsString);
        mTestDetails = new HashMap<>();
      }
      return mTestDetails;
    }

    // get testDetails as a map.
    @SuppressWarnings({"unchecked"})
    Map<String, Object> testDetails =
        (Map<String, Object>)
            this.getExecutionVariable(variables, ExecutionVariable.TEST_DETAILS, Map.class);

    if (testDetails == null) {
      logger.debug(
          logPrefix
              + "Unable to retrieve test details as primitive type String. Setting to an empty JSON.");
      testDetails = new HashMap<>();
    }
    return testDetails;
  }
}

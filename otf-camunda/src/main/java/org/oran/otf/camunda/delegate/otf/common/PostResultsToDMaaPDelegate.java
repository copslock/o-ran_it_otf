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


package org.oran.otf.camunda.delegate.otf.common;

import org.oran.otf.cadi.configuration.FilterCondition;
import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.camunda.model.ExecutionConstants;
import org.oran.otf.camunda.workflow.utility.WorkflowUtility;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.local.DMaaPRequest;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.gson.Convert;
import org.oran.otf.common.utility.http.RequestUtility;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.core.MediaType;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Component;

@Component
@Conditional(value= FilterCondition.class)
public class PostResultsToDMaaPDelegate implements JavaDelegate {

  private static Logger logger = LoggerFactory.getLogger(PostResultsToDMaaPDelegate.class);

  @Value("${otf.cadi.aaf-mech-id}")
  private String AAF_APPID;

  @Value("${otf.cadi.aaf-mech-password}")
  private String AAF_APPPASS;

  @Value("${otf.environment}")
  private String env;

  @Autowired private WorkflowUtility utility;

  private final String template = "https://<hostname>:3905/events/<topic>";

  @Override
  public void execute(DelegateExecution execution) throws Exception {
    logger.info("[PostResultsToDMaaP] Starting to post test results to dmaap.");
    final String logPrefix = Utility.getLoggerPrefix();

    // Get the current test execution object.
    TestExecution testExecution = utility.getTestExecution(execution.getVariables(), logPrefix);

    List<Object> testDataActivity = null;
    Object dataByActivity =
        utility.getTestDataByActivity(
            execution.getVariables(), execution.getCurrentActivityId(), logPrefix);
    if (!(dataByActivity instanceof List)) {
      logger.error(
          execution.getActivityInstanceId()
              + ": Failed to retrieve dmaap requests in test data as list");
      throw new TestExecutionException(
          execution.getActivityInstanceId()
              + ": Missing data to post to dmaap. Failed to retrieve dmaap requests in test data as list");
    }

    // convert data to map and grab dmaaprequest array
    testDataActivity = (List) dataByActivity;
    List<DMaaPRequest> dmaapRequests = null;
    try {
      dmaapRequests =
          Convert.listToObjectList(testDataActivity, new TypeReference<List<DMaaPRequest>>() {});
    } catch (Exception e) {
      logger.error(
          execution.getActivityInstanceId() + ": Failed to get dmaap requests from test data");
      throw new TestExecutionException(
          execution.getActivityInstanceId() + ": Missing data to post to dmaap. " + e.getMessage(),
          e);
    }
    if (dmaapRequests == null || dmaapRequests.isEmpty()) {
      logger.error(execution.getActivityInstanceId() + ": Failed to retrieve dmaap request list");
      throw new TestExecutionException(
          execution.getActivityInstanceId() + ": Missing dmaap request list");
    }

    // Get the testDetails object
    Map<String, Object> testDetails = utility.getTestDetails(execution.getVariables(), logPrefix);

    // Post results to Dmaap
    Map<String, Object> results = postResultsToDmaap(testExecution, dmaapRequests, logPrefix);

    // Set test details to show results of each post to dmaap
    testDetails.put(execution.getCurrentActivityId(), results);
    execution.setVariable(ExecutionConstants.ExecutionVariable.TEST_DETAILS, testDetails);
    logger.info("[PostResultsToDMaaP] Finished posting test results to dmaap.");
  }

  private Map<String, Object> postResultsToDmaap(
      TestExecution execution, List<DMaaPRequest> dmaapRequests, String logPrefix) {
    String payload = execution.toString();
    Map<String, Object> results = new HashMap<>();
    Map<String, String> headers = new HashMap<>();
    headers.put("Authorization", getAuthorizationHeader());
    headers.put("Content-Type", MediaType.APPLICATION_JSON);

    for (DMaaPRequest request : dmaapRequests) {
      String url = new String(template);
      url = url.replace("<hostname>", request.getHostname());
      url = url.replace("<topic>", request.getAsyncTopic());

      try {
        results.put(url, getResponse(url, payload, headers, request.getRequiresProxy()));
      } catch (Exception e) {
        e.printStackTrace();
        logger.info(logPrefix + "Error while posting to dmaap : " + e.getMessage());
        results.put(url, e.getMessage());
      }
    }
    return results;
  }

  private Map<String, Object> getResponse(
      String url, String payload, Map<String, String> headers, boolean proxy)
      throws Exception {
    HttpResponse response = RequestUtility.postSync(url, payload, headers, proxy);
    String sRes = EntityUtils.toString(response.getEntity());
    Map<String, Object> res;
    try {
      res = Convert.jsonToMap(sRes);
    } catch (Exception e) {
      res = new HashMap<>();
      res.put("response", sRes);
    }
    return res;
  }

  private String getAuthorizationHeader() {
    return "Basic "
        + new String(Base64.getEncoder().encode((AAF_APPID + ":" + AAF_APPPASS).getBytes()));
  }
}

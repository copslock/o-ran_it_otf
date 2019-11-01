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


package org.oran.otf.camunda.delegate.otf.common.runnable;


import org.oran.otf.camunda.exception.TestExecutionException;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.TestHead;
import org.oran.otf.common.model.local.TestHeadRequest;
import org.oran.otf.common.model.local.TestHeadResult;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.gson.Convert;
import org.oran.otf.common.utility.http.RequestUtility;
import com.google.common.base.Strings;
import com.google.gson.JsonParser;
import com.mongodb.client.result.UpdateResult;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;
import org.oran.otf.common.utility.http.HeadersUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

// TODO : Create a constructor that does not take a testexecution object as a parameter. This means
// that the result should only be returned, and the call to saveResult should be avoided.
public class TestHeadCallable implements Callable<TestHeadResult> {

  private static Logger logger = LoggerFactory.getLogger(TestHeadCallable.class);
  private final String logPrefix = Utility.getLoggerPrefix();
  private final TestExecution testExecution;

  private final int timeoutInMillis;
  private final String httpMethod;
  private final Map<String, String> headers;
  private final Map<String, Object> body;
  private final TestHead testHead;
  private final String activityId;

  private final MongoTemplate mongoOperation;

  private String url;
  private TestHeadResult result;
  private Date startTime;
  private Date endTime;

  public TestHeadCallable(
      int timeoutInMillis,
      String httpMethod,
      Map<String, String> headers,
      Map<String, Object> vthInput,
      TestHead testHead,
      String activityId,
      TestExecution testExecution,
      MongoTemplate mongoOperation) {
    this.timeoutInMillis = timeoutInMillis;
    this.httpMethod = httpMethod;
    this.headers = headers;
    this.body = vthInput;
    this.testHead = testHead;
    this.activityId = activityId;
    this.testExecution = testExecution;

    this.mongoOperation = mongoOperation;

    // Generate the url after the test head is set.
    this.url = generateUrl();
  }

  @Override
  public TestHeadResult call() throws Exception {
    // If simulation mode is set, then send back expected result after expected delay
    if (testExecution.getHistoricTestInstance().isSimulationMode()) {
      logger.info(logPrefix + "Start call to test head in simulation mode.");
      startTime = new Date(System.currentTimeMillis());
      Map<String, Object> response =
          simulateVTH(
              this.activityId, testExecution.getHistoricTestInstance().getSimulationVthInput());
      endTime = new Date(System.currentTimeMillis());
      logger.info(logPrefix + "Finished call to test head in simulation mode.");

      //TODO: This will need to change if enhancement is made to allow status codes
      TestHeadResult result = generateResult(response);
      testExecution.getTestHeadResults().add(result);
      saveResult(testExecution);
      return result;
    }
    logger.info(logPrefix + "Start call to test head.");
    HttpResponse response = null;
    TestHeadResult result = null;
    // Set the start time right before the request.
    startTime = new Date(System.currentTimeMillis());

    // add api key to headers if required
    setApiKeyIfEnabled();

    //TODO RG Added to slow Execution
    //Thread.sleep(60000);

    try {
      switch (httpMethod.toLowerCase()) {
        case "post":
          response =
              timeoutInMillis > 0
                  ? RequestUtility.postSync(
                      url, Convert.mapToJson(body), headers, timeoutInMillis, false)
                  : RequestUtility.postSync(url, Convert.mapToJson(body), headers, false);
          break;
        case "get":
          response =
              timeoutInMillis > 0
                  ? RequestUtility.getSync(url, headers, timeoutInMillis, false)
                  : RequestUtility.getSync(url, headers, false);
          break;
        default:
          throw new RuntimeException();
      }
      // Set the end time when the request returns.
      endTime = new Date(System.currentTimeMillis());
      logger.info(logPrefix + "Finished call to test head.");

      // Generate and return the result.
      result = generateResult(response);
    } catch (Exception e) {
      Map<String, Object> error = new HashMap<>();
      error.put("error", e.getMessage());
      result = generateFailedResult(error);

      logger.info(logPrefix + "There was an error calling the test head.");
    }

    testExecution.getTestHeadResults().add(result);
    saveResult(testExecution);
    return result;
  }

  private void setApiKeyIfEnabled(){
    if(this.testHead.getAuthorizationEnabled() != null && this.testHead.getAuthorizationEnabled().booleanValue()){
      this.headers.put(HttpHeaders.AUTHORIZATION, testHead.getAuthorizationType() + " " + testHead.getAuthorizationCredential());
    }
  }

  private String generateUrl() {
    String resource = testHead.getResourcePath();
    // Prepend a forward-slash if the resource path exists, and does NOT already start with one. The
    // order of this condition is relevant for null-checks.
    if (!Strings.isNullOrEmpty(resource) && !resource.startsWith("/")) {
      resource = "/" + resource;
    }
    return testHead.getHostname() + ":" + testHead.getPort() + resource;
  }

  private TestHeadResult generateFailedResult(Map<String, Object> error) {
    int statusCodeError = -1;
    TestHeadRequest requestContent = new TestHeadRequest(HeadersUtility.maskAuth(headers), body);

    return new TestHeadResult(
        testHead.get_id(), testHead.getTestHeadName(), testHead.getGroupId(), activityId, statusCodeError, requestContent, error, startTime, endTime);
  }

  private TestHeadResult generateResult(HttpResponse response) throws IOException {
    String sRes = EntityUtils.toString(response.getEntity());
    JsonParser parser = new JsonParser();
    Map<String, Object> res;
    try {
      res = Convert.jsonToMap(sRes);
    } catch (Exception e) {
      res = new HashMap<>();
      res.put("response", sRes);
    }

    TestHeadRequest requestContent = new TestHeadRequest(HeadersUtility.maskAuth(headers), body);

    return new TestHeadResult(
        testHead.get_id(), testHead.getTestHeadName(), testHead.getGroupId(), activityId, response.getStatusLine().getStatusCode(), requestContent, res, startTime, endTime);
  }

  private TestHeadResult generateResult(Map<String, Object> res) {

    //TODO: This will need to change if enhancement is made to allow status codes
    TestHeadRequest requestContent = new TestHeadRequest(HeadersUtility.maskAuth(headers), body);

    return new TestHeadResult(
        testHead.get_id(), testHead.getTestHeadName(), testHead.getGroupId(), activityId, 200, requestContent, res, startTime, endTime);
  }

  private void saveResult(TestExecution testExecution) {
    Query query = new Query();
    //TODO: Update for Azure
    query.addCriteria((Criteria.where("groupId").is(testExecution.getGroupId())));
    query.addCriteria(Criteria.where("_id").is(testExecution.get_id()));
    // Also add businessKey as a criteria because the object won't be found if the business key
    // was somehow modified in the workflow.
    query.addCriteria(Criteria.where("businessKey").is(testExecution.getBusinessKey()));
    Update update = new Update();
    update.set("testHeadResults", testExecution.getTestHeadResults());
    UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
    // Check the status of the findAndUpdate database, and appropriately handle the errors.
    if (result.getMatchedCount() == 0) {
      throw new TestExecutionException(
          String.format(
              "Unable to log the test result because a testExecution associated with _id, %s and businessKey %s, was not found.",
              testExecution.get_id(), testExecution.getBusinessKey()));
    } else if (result.getModifiedCount() == 0) {
      throw new TestExecutionException("Unable to persist the testExecution to the database.");
    }
  }

  private Map<String, Object> simulateVTH(String activityId, Map<String, Object> simulationVth) {
    int delay = 0;
    Map response = new HashMap<String, Object>();
    if (simulationVth.containsKey(activityId)) {
      Object obj = simulationVth.get(activityId);
      if (obj instanceof Map) {
        simulationVth = (Map) obj;
      }
    } else {
      return null;
    }

    if (simulationVth.containsKey("delay")) {
      Object obj = simulationVth.get("delay");
      if (obj instanceof Integer) {
        delay = (int) obj;
      }
    }

    if (simulationVth.containsKey("response")) {
      Object obj = simulationVth.get("response");
      if (obj instanceof Map) {
        response = (Map) obj;
      }
    }
    logger.info(logPrefix + "Starting simulated call to test head.");

    try {
      Thread.sleep(delay);
    } catch (InterruptedException e) {
      e.printStackTrace();
      logger.info(logPrefix + "Error simulating call to test head.");
      return null;
    }
    logger.info(logPrefix + "Finished simulating call to test head.");
    return response;
  }
}

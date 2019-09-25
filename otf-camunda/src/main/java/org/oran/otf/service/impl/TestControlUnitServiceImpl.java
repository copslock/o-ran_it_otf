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


package org.oran.otf.service.impl;

import org.oran.otf.camunda.delegate.otf.common.runnable.AsynchronousTestInstanceCallable;
import org.oran.otf.camunda.delegate.otf.common.runnable.SynchronousTestInstanceCallable;
import org.oran.otf.camunda.exception.WorkflowProcessorException;
import org.oran.otf.camunda.workflow.WorkflowProcessor;
import org.oran.otf.camunda.workflow.WorkflowRequest;
import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.TestInstance;
import org.oran.otf.common.repository.TestExecutionRepository;
import org.oran.otf.common.repository.TestInstanceRepository;
import org.oran.otf.common.utility.gson.Convert;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.TestControlUnitService;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;

@Service
public class TestControlUnitServiceImpl implements TestControlUnitService {

  private static Logger logger = LoggerFactory.getLogger(TestControlUnitServiceImpl.class);

  @Autowired
  TestInstanceRepository testInstanceRepository;

  @Autowired
  TestExecutionRepository testExecutionRepository;

  @Autowired
  MongoTemplate mongoOperation;

  @Autowired
  WorkflowProcessor processor;

  @Override
  public Response executeByTestInstanceId(String testInstanceId) {
    try {
      TestInstance testInstance = testInstanceRepository.findById(testInstanceId).orElse(null);
      if (testInstance == null) {
        return Response.status(404).entity("Test Instance not found.").build();
      }

      WorkflowRequest req = new WorkflowRequest();
      req.setAsync(false);
      req.setExecutorId(new ObjectId("5cb72a7e10ba2a0042e6282a"));
      req.setTestInstanceId(testInstance.get_id());
      req.setTestData(testInstance.getTestData());
      req.setVthInput(testInstance.getVthInput());
      req.setPfloInput(testInstance.getPfloInput());
      req.setMaxExecutionTimeInMillis(testInstance.getMaxExecutionTimeInMillis());
      return processWorkflowRequest(req);
    } catch (Exception e) {
      return ResponseUtility.Build.internalServerErrorWithMessage(e.getMessage());
    }
  }

  @Override
  public Response executeByWorkflowRequest(String workflowRequestJson) {
    try {
      WorkflowRequest workflowRequest =
          Convert.jsonToObject(workflowRequestJson, new TypeReference<WorkflowRequest>() {
          });

      return processWorkflowRequest(workflowRequest);
    } catch (IOException e) {
      logger.error(e.getMessage());
      return ResponseUtility.Build.badRequestWithMessage(e.getMessage());
    }
  }

  private Response processWorkflowRequest(WorkflowRequest request) {
    TestExecution testExecution = null;
    int statusCode = 200;
    try {
      if (request.isAsync()) {
        AsynchronousTestInstanceCallable asynchronousTestInstanceCallable =
            new AsynchronousTestInstanceCallable(
                request, testExecutionRepository, processor, mongoOperation);
        testExecution = asynchronousTestInstanceCallable.call();
      } else {
        SynchronousTestInstanceCallable synchronousTestInstanceCallable =
            new SynchronousTestInstanceCallable(
                request, testExecutionRepository, processor, mongoOperation);
        testExecution = synchronousTestInstanceCallable.call();
      }
    } catch (WorkflowProcessorException e) {
      testExecution = e.getWorkflowResponse().getTestExecution();
      statusCode = e.getWorkflowResponse().getMessageCode();
    }
    return ResponseUtility.Build.genericWithMessage(statusCode, testExecution.toString());
  }
}

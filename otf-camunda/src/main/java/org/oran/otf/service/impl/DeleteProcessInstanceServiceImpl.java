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

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.service.ProcessEngineAwareService;
import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import org.oran.otf.common.utility.gson.Convert;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.DeleteProcessInstanceService;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.core.Response;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DeleteProcessInstanceServiceImpl extends ProcessEngineAwareService
    implements DeleteProcessInstanceService {

  private static Logger logger = LoggerFactory.getLogger(DeleteProcessInstanceServiceImpl.class);

  @Override
  public Response deleteProcessInstance(String executionId) {
    RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();

    Map<String, Object> response =
        deleteProcessInstanceInternal(
            executionId, "Deleted via TCU endpoint at " + new Date(System.currentTimeMillis()));

    try {
      int code = (int) response.get("code");
      String sRes = Convert.mapToJson(response);
      if (code == 404) {
        return ResponseUtility.Build.notFoundWithMessage(sRes);
      } else if (code == 200) {
        return ResponseUtility.Build.okRequestWithMessage(sRes);
      }
    } catch (ClassCastException cce) {
      logger.error(cce.getMessage());
    }
    // Unhandled response
    return ResponseUtility.Build.internalServerError();
  }

  public Map<String, Object> deleteProcessInstanceInternal(
      String executionId, String deleteReason) {
    RuntimeService runtimeService = BpmPlatform.getProcessEngineService().getProcessEngine(OtfCamundaConfiguration.processEngineName).getRuntimeService();

    ProcessInstance pi =
        runtimeService.createProcessInstanceQuery().processInstanceId(executionId).singleResult();

    Map<String, Object> response = new HashMap<>();

    if (pi == null) {
      response.put(
          "result",
          String.format("A process instance with the executionId %s was not found.", executionId));
      response.put("code", 404);
    } else {
      List<WorkflowTask> workflowTasks = WorkflowTask.workflowTasksByExecutionId.get(executionId);
      if (workflowTasks != null) {
        for (WorkflowTask workflowTask : workflowTasks) {
          workflowTask.shutdown();
        }
      }

      runtimeService.deleteProcessInstance(executionId, deleteReason);
      response.put("result", "Successfully deleted.");
      response.put("code", 200);
    }

    return response;
  }
}

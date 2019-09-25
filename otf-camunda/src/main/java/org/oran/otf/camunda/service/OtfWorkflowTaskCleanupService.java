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


package org.oran.otf.camunda.service;

import org.oran.otf.camunda.workflow.utility.WorkflowTask;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OtfWorkflowTaskCleanupService {
  @Autowired RuntimeService runtimeService;
  public static boolean isEnabled = false;

  @EventListener(ApplicationReadyEvent.class)
  public void init() {
    Thread otfCleanupService = new Thread(new Worker());
    otfCleanupService.start();
  }

  public class Worker implements Runnable {
    @Override
    public void run() {
      try {
        while (true) {
          if (isEnabled) {
            synchronized (WorkflowTask.workflowTasksByExecutionId) {
              Set<Entry<String, List<WorkflowTask>>> set =
                  WorkflowTask.workflowTasksByExecutionId.entrySet();

              for (Entry<String, List<WorkflowTask>> entry : set) {
                String processInstanceId = entry.getKey();
                List<WorkflowTask> workflowTasks = entry.getValue();

                ProcessInstance processInstance =
                    runtimeService
                        .createProcessInstanceQuery()
                        .processInstanceId(processInstanceId)
                        .singleResult();

                if (processInstance == null) {
                  System.out.println("Cleaning up WorkflowTasks under processInstanceId, " + processInstanceId);
                  workflowTasks.forEach(WorkflowTask::shutdown);
                }
              }
            }
          }
          Thread.sleep(10000);
        }
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }
}

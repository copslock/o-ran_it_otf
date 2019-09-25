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

import org.oran.otf.camunda.configuration.OtfCamundaConfiguration;
import org.oran.otf.camunda.delegate.otf.common.CallTestHeadDelegate;
import org.oran.otf.camunda.delegate.otf.common.RunTestInstanceDelegate;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadLocalRandom;
import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.ExternalTaskService;
import org.camunda.bpm.engine.externaltask.LockedExternalTask;
import org.camunda.bpm.engine.variable.VariableMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OtfExternalTaskService {

  private static Logger logger = LoggerFactory.getLogger(OtfExternalTaskService.class);
  public static boolean isEnabled;
  private static long pollIntervalInMillis = 1000;
  @Autowired CallTestHeadDelegate callTestHeadDelegate;
  @Autowired RunTestInstanceDelegate runTestInstanceDelegate;
  private ExternalTaskService externalTaskService;

  private List<LockedExternalTask> externalTasks;

  @Value("${otf.camunda.executors-active}")
  private boolean executorsActive;

  @EventListener(ApplicationReadyEvent.class)
  public void initialize() {
    this.externalTaskService =
        BpmPlatform.getProcessEngineService()
            .getProcessEngine(OtfCamundaConfiguration.processEngineName)
            .getExternalTaskService();

    pollIntervalInMillis = ThreadLocalRandom.current().nextLong(500, 5000);
    //    this.externalTaskService =
    //        BpmPlatform.getProcessEngineService()
    //            .getProcessEngine(OtfCamundaConfiguration.processEngineName)
    //            .getExternalTaskService();

    logger.info(
        "Initializing external task service with poll interval at {}", pollIntervalInMillis);
    externalTasks = new ArrayList<>();
    isEnabled = this.executorsActive;
    logger.info("External Task Worker otf.camunda.executors-active set to : "  + this.executorsActive);
    Thread t =
        new Thread(
            () -> {
              while (true) {
                try {
                  if (isEnabled) {
                    acquire();
                  }

                  Thread.sleep(pollIntervalInMillis);
                } catch (Exception e) {
                  logger.error(e.getMessage());
                }
              }
            });

    t.start();
  }

  private void acquire() {
    externalTasks.clear();
    List<LockedExternalTask> externalTasks =
        externalTaskService
            .fetchAndLock(10, "etw_" + OtfCamundaConfiguration.processEngineName)
            .topic("vth", 43200000)
            .enableCustomObjectDeserialization()
            .topic("testInstance", 43200000)
            .enableCustomObjectDeserialization()
            .execute();
    externalTasks.forEach(this::handleExternalTask);
  }

  private void handleExternalTask(LockedExternalTask task) {
    logger.info("[" + task.getId() + "]: Handling external task for topic: " + task.getTopicName());
    String topicName = task.getTopicName();
    ExternalTaskCallable callable;

    // Set retries to 0 for the current task.
    // externalTaskService.setRetries(task.getId(), 0);

    switch (topicName) {
      case "vth":
        callable = new ExternalTaskCallable(task, OtfExternalTask.VTH);
        break;
      case "testInstance":
        callable = new ExternalTaskCallable(task, OtfExternalTask.TEST_INSTANCE);
        break;
      default:
        String err = String.format("The topic name %s has no external task handler.", topicName);
        logger.error(err);
        externalTaskService.handleFailure(task.getId(), task.getWorkerId(), err, 0, 0);
        return;
    }

    try {
      ThreadFactory namedThreadFactory =
          new ThreadFactoryBuilder().setNameFormat("etw-" + task.getTopicName() + "-%d").build();
      namedThreadFactory.newThread(callable).start();
    } catch (Exception e) {
      externalTaskService.handleFailure(
          task.getId(), task.getWorkerId(), e.getMessage(), e.toString(), 0, 0);
    }
  }

  public enum OtfExternalTask {
    VTH,
    TEST_INSTANCE
  }

  public class ExternalTaskCallable implements Runnable {

    private final LockedExternalTask task;
    private final OtfExternalTask type;

    private final String activityId;
    private final String processDefinitionId;
    private final String processInstanceId;
    private final String processBusinessKey;
    private VariableMap variables;

    private ExternalTaskCallable(LockedExternalTask lockedExternalTask, OtfExternalTask type) {
      this.task = lockedExternalTask;
      this.type = type;

      this.activityId = task.getActivityId();
      this.processDefinitionId = task.getProcessDefinitionId();
      this.processInstanceId = task.getProcessInstanceId();
      this.processBusinessKey = task.getBusinessKey();
      this.variables = task.getVariables();
    }

    @Override
    public void run() {
      try {
        if (type == OtfExternalTask.VTH) {
          callTestHeadDelegate.callTestHead(
              activityId, processDefinitionId, processInstanceId, processBusinessKey, variables);
        } else if (type == OtfExternalTask.TEST_INSTANCE) {
          runTestInstanceDelegate.runTestInstance(activityId, processInstanceId, variables);
        } else {
          logger.error(
              String.format(
                  "Could not find the appropriate function for external task with id %s.", type));
        }
      } catch (Exception e) {
        String err = String.format("Encountered error %s", e.getMessage());
        externalTaskService.handleFailure(
            task.getId(), task.getWorkerId(), e.getMessage(), err, 0, 0);
        return;
      }

      synchronized (externalTaskService) {
        try {
          externalTaskService.complete(task.getId(), task.getWorkerId(), variables);
        } catch (Exception e) {
          String err = String.format("Encountered error %s", e.getMessage());
          e.printStackTrace();
          externalTaskService.handleFailure(
                  task.getId(), task.getWorkerId(), e.getMessage(), err, 0, 0);
        }
      }
    }
  }
}

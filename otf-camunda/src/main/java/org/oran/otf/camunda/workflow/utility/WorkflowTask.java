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

import org.oran.otf.common.utility.Utility;
import com.google.common.base.Strings;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WorkflowTask {

  private static final Logger logger = LoggerFactory.getLogger(WorkflowTask.class);
  private static final String logPrefix = Utility.getLoggerPrefix();

  public static Map<String, List<WorkflowTask>> workflowTasksByExecutionId =
      new ConcurrentHashMap<>();
  // The processInstanceId of the Camunda process instance the thread pool is created under.
  private final String processInstanceId;
  // The pool service used to create the fixed thread pool.
  private final ExecutorService pool;
  // Used to keep track of all the tasks to be executed, which allows tasks to easily be deleted.
  private List<Future<?>> futures;
  // Used to determine if currently running threads should be interrupted
  private boolean interruptOnFailure;

  public WorkflowTask(String executionId, int threads, boolean interruptOnFailure) {
    if (threads <= 0 || Strings.isNullOrEmpty(executionId)) {
      this.processInstanceId = null;
      this.pool = null;
      return;
    }

    ThreadFactory namedThreadFactory =
        new ThreadFactoryBuilder().setNameFormat(executionId + "-%d").build();

    this.processInstanceId = executionId;
    this.pool =
        threads == 1
            ? Executors.newSingleThreadExecutor()
            : Executors.newFixedThreadPool(threads, namedThreadFactory);
    this.futures = Collections.synchronizedList(new ArrayList<>());
    this.interruptOnFailure = interruptOnFailure;

    synchronized (WorkflowTask.workflowTasksByExecutionId) {
      if (!WorkflowTask.workflowTasksByExecutionId.containsKey(this.processInstanceId)) {
        List<WorkflowTask> list = new ArrayList<>();
        list.add(this);
        WorkflowTask.workflowTasksByExecutionId.put(
            this.processInstanceId, Collections.synchronizedList(list));
      } else {
        WorkflowTask.workflowTasksByExecutionId.get(this.processInstanceId).add(this);
      }
    }
  }

  public void shutdown() {
    this.shutdown(this.interruptOnFailure);
  }

  public void shutdown(boolean interruptOnFailure) {
    if (interruptOnFailure) {
      // Cancel currently executing tasks, and halt any waiting tasks.
      pool.shutdownNow();
    } else {
      // Disable new tasks from being submitted, while allowing currently executing tasks to finish.
      pool.shutdown();
    }

    try {
      // Wait a while for existing tasks to terminate
      if (!pool.awaitTermination(60, TimeUnit.SECONDS)) {
        for (Future<?> f : futures) {
          f.cancel(interruptOnFailure);
        }

        // Wait a while for tasks to respond to being cancelled
        if (!pool.awaitTermination(60, TimeUnit.SECONDS)) {
          System.err.println("Pool did not terminate");
        }
      }
    } catch (InterruptedException ie) {
      // (Re-)Cancel if current thread also interrupted
      pool.shutdownNow();
      // Preserve interrupt status
      // Thread.currentThread().interrupt();
    }

    workflowTasksByExecutionId.remove(this.processInstanceId);
  }

  public String getProcessInstanceId() {
    return processInstanceId;
  }

  public ExecutorService getPool() {
    return pool;
  }

  public List<Future<?>> getFutures() {
    return futures;
  }

  public void setFutures(List<Future<?>> futures) {
    this.futures = futures;
  }

  public static void printWorkflowTaskResources() {
    for (Map.Entry<String, List<WorkflowTask>> entry : workflowTasksByExecutionId.entrySet()) {
      logger.info(
          "{}--------------Parent processInstanceId: {}--------------", logPrefix, entry.getKey());

      List<WorkflowTask> workflowTasks =
          workflowTasksByExecutionId.getOrDefault(entry.getKey(), null);
      for (WorkflowTask task : workflowTasks) {
        task.print();
      }
    }
  }

  public static void printThreadInformation() {
    Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
    for (Thread t : threadSet) {
      if (t.getThreadGroup() == Thread.currentThread().getThreadGroup()) {
        logger.info("{}{}", logPrefix, t.toString());
      }
    }
  }

  private void print() {
    logger.info("%sWorkflowTask processInstanceId{})", this.processInstanceId);
    if (this.pool instanceof ThreadPoolExecutor) {
      ThreadPoolExecutor tpe = (ThreadPoolExecutor) pool;

      logger.info("\tActive count: {}.", tpe.getActiveCount());
      logger.info("\tTask status: {}/{}.", tpe.getCompletedTaskCount(), tpe.getTaskCount());
      logger.info("\tPool size: {}.", tpe.getPoolSize());
      logger.info("\tCore pool size: {}.", tpe.getCorePoolSize());
      logger.info("\tQueue size: {}.", tpe.getQueue().size());
    }
  }
}

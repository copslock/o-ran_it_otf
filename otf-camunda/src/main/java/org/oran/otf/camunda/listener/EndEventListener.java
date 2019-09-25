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


package org.oran.otf.camunda.listener;

import org.oran.otf.event.TestInstanceCompletionEvent;
import com.google.gson.JsonObject;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.extension.reactor.bus.CamundaSelector;
import org.camunda.bpm.extension.reactor.spring.listener.ReactorExecutionListener;
import org.camunda.bpm.model.bpmn.instance.EndEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@CamundaSelector(event = ExecutionListener.EVENTNAME_END)
public class EndEventListener extends ReactorExecutionListener {

  private static Logger LOGGER = LoggerFactory.getLogger(EndEventListener.class);

  @Autowired
  private ApplicationEventPublisher publisher;

  @Override
  public void notify(DelegateExecution execution) {
    JsonObject jmsg = new JsonObject();
    jmsg.addProperty("executionId", execution.getProcessInstanceId());
    jmsg.addProperty("origin", "otf-camunda");
    if (execution.getBpmnModelElementInstance() instanceof EndEvent) {
      LOGGER.info(execution.getProcessInstanceId() + " is finished.");
      jmsg.addProperty("status", "completed");
      publisher.publishEvent(new TestInstanceCompletionEvent(this, jmsg, execution));
    }
  }

  private void onEndEvent(DelegateExecution execution) {

  }

  private void onVthEnd(DelegateExecution execution) {
    // Useful for reporting back the result of a VTH
  }
}

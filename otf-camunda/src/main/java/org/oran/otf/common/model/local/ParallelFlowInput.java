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

import org.oran.otf.camunda.workflow.WorkflowRequest;
import org.oran.otf.common.utility.gson.Convert;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class ParallelFlowInput implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<WorkflowRequest> args;
    private boolean interruptOnFailure;
    private int maxFailures;
    private int threadPoolSize;

    public ParallelFlowInput() {
    }

    @JsonCreator
    public ParallelFlowInput(
        @JsonProperty(value = "args", required = true) List<WorkflowRequest> args,
        @JsonProperty(value = "interruptOnFailure", required = true) boolean interruptOnFailure,
        @JsonProperty(value = "maxFailures", required = true) int maxFailures,
        @JsonProperty(value = "threadPoolSize", required = true) int threadPoolSize) {
        this.args = args;
        this.interruptOnFailure = interruptOnFailure;
        this.maxFailures = maxFailures;
        this.threadPoolSize = threadPoolSize;
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public List<WorkflowRequest> getArgs() {
        return args;
    }

    public void setArgs(List<WorkflowRequest> args) {
        this.args = args;
    }

    public boolean isInterruptOnFailure() {
        return interruptOnFailure;
    }

    public void setInterruptOnFailure(boolean interruptOnFailure) {
        this.interruptOnFailure = interruptOnFailure;
    }

    public int getMaxFailures() {
        return maxFailures;
    }

    public void setMaxFailures(int maxFailures) {
        this.maxFailures = maxFailures;
    }

    public int getThreadPoolSize() {
        return threadPoolSize;
    }

    public void setThreadPoolSize(int threadPoolSize) {
        this.threadPoolSize = threadPoolSize;
    }

    @Override
    public String toString() {
        return Convert.objectToJson(this);
    }
}

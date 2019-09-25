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

import org.oran.otf.common.utility.gson.Convert;
import com.fasterxml.jackson.annotation.JsonProperty;

public class DMaaPRequest {
    private String hostname;
    private String asyncTopic;
    private boolean requiresProxy;

    public DMaaPRequest() {
    }

    public DMaaPRequest(
            @JsonProperty(value = "hostname", required = true) String hostname,
            @JsonProperty(value = "asyncTopic", required = true) String asyncTopic,
            @JsonProperty(value = "requriesProxy", required = false) boolean requiresProxy) {
        this.hostname = hostname;
        this.asyncTopic = asyncTopic;
        this.requiresProxy = requiresProxy;

    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getAsyncTopic() {
        return asyncTopic;
    }

    public void setAsyncTopic(String asyncTopic) {
        this.asyncTopic = asyncTopic;
    }

    public boolean getRequiresProxy(){
        return this.requiresProxy;
    }

    public void setRequiresProxy(boolean requiresProxy) {
        this.requiresProxy = requiresProxy;
    }

    @Override
    public String toString() {
        return Convert.objectToJson(this);
    }
}


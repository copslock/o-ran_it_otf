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

import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.service.HealthService;
import javax.ws.rs.core.Response;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.Incident;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealthServiceImpl implements HealthService {

  private HealthServiceImpl() {
    // prohibit instantiation
  }

  @Override
  public Response getHealth() {
    return ResponseUtility.Build.okRequestWithMessage("UP");
  }
}

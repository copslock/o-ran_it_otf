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


package org.oran.otf.service;


import org.glassfish.jersey.media.multipart.FormDataParam;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;

import java.io.InputStream;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.MediaType.MULTIPART_FORM_DATA;

@Path("/tcu")
public interface TestDefinitionDeploymentService {

    @POST
    @Path("/deploy-test-strategy-zip/v1")
    @Consumes(MULTIPART_FORM_DATA)
    @Produces(APPLICATION_JSON)
    Response deployTestStrategyWithResources(@FormDataParam("bpmn") InputStream bpmn,
                                             @FormDataParam("resources") InputStream resourcesZip);

    @GET
    @Path("/testDefinition/v1/processDefinitionKey/{processDefinitionKey}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Response isProcessDefinitionDeployed(@PathParam("processDefinitionKey") String processDefinitionKey);

}

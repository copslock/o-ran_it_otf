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

import javax.ws.rs.*;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("/tcu")
public interface DeleteTestDefinitionService {

    @DELETE
    @Path("/delete-test-strategy/v1/deployment-id/{deploymentId}/")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Response deleteTestStrategyByDeploymentId(@PathParam("deploymentId") String deploymentId);



    @DELETE
    @Path("/delete-test-strategy/v1/test-definition-id/{testDefinitionId}/")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public Response deleteTestStrategyByTestDefinitionId(@PathParam("testDefinitionId") String testDefinitionId);



//    @DELETE
//    @Path("/delete-all-test-strategies/v1/")
//    @Consumes(APPLICATION_JSON)
//    @Produces(APPLICATION_JSON)
//    Response deleteAllTestStrategies();
}

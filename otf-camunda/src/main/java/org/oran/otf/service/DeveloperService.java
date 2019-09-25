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

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

@Path("/tcu")
public interface DeveloperService {
  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/workflowTaskCleanup/v1/{enabled}")
  Response workflowTaskCleanup(@PathParam("enabled") String enabled);

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/externalTaskWorker/v1/{enabled}")
  Response externalTaskWorker(@PathParam("enabled") String enabled);

  @GET
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/printThreads/v1")
  Response printThreads(@Context HttpServletRequest request);

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/jobExecutor/v1/activate")
  Response activateJobExecutor();

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/jobExecutor/v1/deactivate")
  Response deActivateJobExecutor();

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/gracefulshutdown/v1")
  Response gracefulShutdown();

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/disableGracefulShutdown/v1")
  Response disableGracefulShutdown();

  @POST
  @Consumes(APPLICATION_JSON)
  @Produces(APPLICATION_JSON)
  @Path("/dev/enableGracefulShutdown/v1")
  Response enableGracefulShutdown();
}

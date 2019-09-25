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


package org.oran.otf.api.service;

import io.swagger.annotations.Api;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.InputStream;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.glassfish.jersey.media.multipart.FormDataParam;

@Api
@Hidden
@Path("/testStrategy")
@Tag(name = "Test Service", description = "Deploy and delete test strategies to and from the test control unit. (This documentation will only be available to the development team)")
@Produces({MediaType.APPLICATION_JSON})
public interface TestStrategyService {
  @POST
  @Hidden
  @Path("/deploy/v1")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  Response deployTestStrategy(
      @FormDataParam("bpmn") InputStream bpmn,
      @FormDataParam("resources") InputStream compressedResources,
      @FormDataParam("testDefinitionId") String testDefinitionId,
      @FormDataParam("testDefinitionDeployerId") String testDefinitionDeployerId,
      @FormDataParam("definitionId") String definitionId,
      @HeaderParam("Authorization") String authorization);

  @DELETE
  @Hidden
  @Path("/delete/v1/testDefinitionId/{testDefinitionId}")
  Response deleteByTestDefinitionId(
      @PathParam("testDefinitionId") String testDefinitionId,
      @HeaderParam("authorization") String authorization);

  @DELETE
  @Hidden
  @Path("/delete/v1/deploymentId/{deploymentId}")
  Response deleteByDeploymentId(
      @PathParam("deploymentId") String deploymentId,
      @HeaderParam("authorization") String authorization);
}

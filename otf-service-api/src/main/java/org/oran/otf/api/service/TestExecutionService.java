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

import org.oran.otf.common.model.TestExecution;
import org.oran.otf.common.model.local.OTFApiResponse;
import io.swagger.annotations.Api;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.stereotype.Component;

@Component
@Api
@Path("/testExecution")
@Tag(name = "Test Services", description = "")
@Produces(MediaType.APPLICATION_JSON)
public interface TestExecutionService {
  @GET
  @Path("v1/status/executionId/{executionId}")
  @Produces({MediaType.APPLICATION_JSON})
  @Operation(
      description = "Respond with a test execution object if it exists",
      summary = "Find test execution log by processInstanceId",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The created Test Instance object is returned when it is created",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestExecution.class))
            })
      })
  Response getExecutionStatus(
      @HeaderParam("Authorization") String authorization,
      @PathParam("executionId") String executionId);

  @GET
  @Path("v1/executionId/{executionId}")
  @Produces({MediaType.APPLICATION_JSON})
  @Operation(
      description =
          "Respond with a test execution object, and state of the process instance if it exists.",
      summary = "Find test execution log by executionId",
      responses = {
          @ApiResponse(
              responseCode = "200",
              description = "The created Test Instance object is returned when it is created",
              content = {
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = TestExecution.class))
              }),
          @ApiResponse(
              responseCode = "404",
              description =
                  "No process instance was found with the executionId used to query the service",
              content = {
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = OTFApiResponse.class))
              })
      })
  Response getExecution(
      @HeaderParam("Authorization") String authorization,
      @PathParam("executionId") String executionId);
}

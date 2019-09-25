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
import org.oran.otf.common.model.TestInstance;
import org.oran.otf.common.model.local.OTFApiResponse;
import org.oran.otf.common.model.local.TestInstanceCreateRequest;
import org.oran.otf.common.model.local.WorkflowRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.stereotype.Component;

@Component
@Path("/testInstance")
@Tag(name = "Test Services", description = "")
@Produces(MediaType.APPLICATION_JSON)
public interface TestInstanceService {
  @POST
  @Path("/execute/v1/id/{testInstanceId}")
  @Operation(
      description =
          "Execute a test instance by it's unique identifier. Test instances can be executed"
              + " either both synchronously and asynchronously.",
      summary = "Execute test instance by id",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description =
                "A successful synchronously executed test returns a test execution object",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TestExecution.class))),
        @ApiResponse(
            responseCode = "201",
            description =
                "A successful asynchronously executed test instance returns a base test execution.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TestExecution.class))),
        @ApiResponse(
            responseCode = "401",
            description =
                "The mechanized identifier used with the request is prohibited from accessing the resource.",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = OTFApiResponse.class))
            })
      })
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  Response execute(
      @Parameter(
              allowEmptyValue = false,
              description = "A string representation of a BSON ObjectId",
              example = "12345678912345678912345f",
              required = true,
              schema =
                  @Schema(
                      type = "string",
                      format = "objectid",
                      description = "The UUID of the test instance"))
          @PathParam("testInstanceId")
          String testInstanceId,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization,
      WorkflowRequest request);

  @POST
  @Operation(
      description = "Create a test instance using the latest version of the test definition.",
      summary = "Create test instance by test definition id",
      responses = {
        @ApiResponse(
            responseCode = "201",
            description = "The created Test Instance object is returned when it is created",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestInstance.class))
            })
      })
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/create/v1/testDefinitionId/{testDefinitionId}")
  Response createByTestDefinitionId(
      @Parameter(
              allowEmptyValue = false,
              description = "A string representation of a BSON ObjectId",
              example = "12345678912345678912345f",
              required = true,
              schema =
                  @Schema(
                      type = "string",
                      format = "uuid",
                      description = "The UUID of the test definition"))
          @PathParam("testDefinitionId")
          String testDefinitionId,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization,
      TestInstanceCreateRequest request);

  @POST
  @Operation(
      description = "Create a test instance using the specified version of the test definition",
      summary = "Create test instance by test definition id and version",
      responses = {
        @ApiResponse(
            responseCode = "201",
            description = "The created Test Instance object is returned when it is created",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestInstance.class))
            })
      })
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/create/v1/testDefinitionId/{testDefinitionId}/version/{version}")
  Response createByTestDefinitionId(
      @Parameter(
              allowEmptyValue = false,
              description = "A string representation of a BSON ObjectId",
              example = "12345678912345678912345f",
              required = true,
              schema =
                  @Schema(
                      type = "string",
                      format = "uuid",
                      description = "The UUID of the test definition."))
          @PathParam("testDefinitionId")
          String testDefinitionId,
      @Parameter(
              allowEmptyValue = false,
              description = "The version of the test definition used to create the instance",
              example = "2",
              required = true)
          @PathParam("version")
          int version,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization,
      TestInstanceCreateRequest request);

  @POST
  @Operation(
      description = "Create a test instance using the latest version of the test definition",
      summary = "Create test instance by process definition key",
      responses = {
        @ApiResponse(
            responseCode = "201",
            description = "The created Test Instance object is returned when it is created",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestInstance.class))
            })
      })
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/create/v1/processDefinitionKey/{processDefinitionKey}")
  Response createByProcessDefinitionKey(
      @Parameter(
              allowEmptyValue = false,
              description = "The process definition key associated with the test definition",
              example = "someUniqueProcessDefinitionKey",
              required = true)
          @PathParam("processDefinitionKey")
          String processDefinitionKey,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization,
      TestInstanceCreateRequest request);

  @POST
  @Operation(
      description = "Create a test instance using the unique process definition key and version",
      summary = "Create test instance by process definition key and version",
      responses = {
        @ApiResponse(
            responseCode = "201",
            description = "The created Test Instance object is returned when it is created",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestInstance.class))
            })
      })
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/create/v1/processDefinitionKey/{processDefinitionKey}/version/{version}")
  Response createByProcessDefinitionKey(
      @Parameter(
              allowEmptyValue = false,
              description = "The process definition key associated with the test definition",
              example = "someUniqueProcessDefinitionKey",
              required = true)
          @PathParam("processDefinitionKey")
          String processDefinitionKey,
      @Parameter(
              allowEmptyValue = false,
              description = "The version of the test definition used to create the instance",
              example = "2",
              required = true)
          @PathParam("version")
          int version,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization,
      TestInstanceCreateRequest request);

  @GET
  @Operation(
      description = "Finds a test instance by it's unique identifier",
      summary = "Find test instance by id",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A Test Instance object is returned if it exists",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = TestInstance.class))
            })
      })
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/v1/id/{id}")
  Response findById(
      @Parameter(
              allowEmptyValue = false,
              description = "A string representation of a BSON ObjectId",
              example = "12345678912345678912345f",
              required = true,
              schema =
                  @Schema(
                      type = "string",
                      format = "uuid",
                      description = "The UUID of the test instance"))
          @PathParam("id")
          String testInstanceId,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization);

  @GET
  @Operation(
      description = "Finds all test instance belonging to the unique process definition key",
      summary = "Find test instance(s) by process definition key",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of found Test Instance objects are returned",
            content = {
              @Content(
                  array = @ArraySchema(schema = @Schema(implementation = TestInstance.class)),
                  mediaType = "application/json")
            })
      })
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/v1/processDefinitionKey/{processDefinitionKey}")
  Response findByProcessDefinitionKey(
      @Parameter(
              allowEmptyValue = false,
              description = "The process definition key associated with the test definition",
              example = "someUniqueProcessDefinitionKey",
              required = true)
          @PathParam("processDefinitionKey")
          String processDefinitionKey,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization);

  @GET
  @Operation(
      description =
          "Finds all test instance belonging to the unique process definition key and version",
      summary = "Find test instance(s) by process definition key and version",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of found Test Instance objects are returned",
            content = {
              @Content(
                  array = @ArraySchema(schema = @Schema(implementation = TestInstance.class)),
                  mediaType = "application/json")
            })
      })
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/v1/processDefinitionKey/{processDefinitionKey}/version/{version}")
  Response findByProcessDefinitionKeyAndVersion(
      @Parameter(
              allowEmptyValue = false,
              description = "The process definition key associated with the test definition",
              example = "someUniqueProcessDefinitionKey",
              required = true)
          @PathParam("processDefinitionKey")
          String processDefinitionKey,
      @Parameter(
              allowEmptyValue = false,
              description = "The version of the test definition used to create the instance",
              example = "2",
              required = true)
          @PathParam("version")
          String version,
      @Parameter(
              allowEmptyValue = false,
              description = "Base64 encoded Application Authorization Framework credentials",
              example = "Basic b3RmQGF0dC5jb206cGFzc3dvcmQxMjM=",
              required = true)
          @HeaderParam("Authorization")
          String authorization);
}

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

import org.oran.otf.common.model.TestHead;
import org.oran.otf.common.model.local.OTFApiResponse;
import io.swagger.annotations.Api;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.ws.rs.*;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Api
@Path("/virtualTestHead")
@Tag(name = "Health Service", description = "Query the availability of the API")
@Produces({MediaType.APPLICATION_JSON})
public interface VirtualTestHeadService {

    @PATCH
    @Path("/v1/{testHeadName}")
    @Produces({MediaType.APPLICATION_JSON})
    @Operation(
            summary = "Used to update fields in the virtual test head",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "The response will include the new vth object",
                            content =
                            @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = OTFApiResponse.class)))
            })
    Response updateVirtualTestHead(@HeaderParam(HttpHeaders.AUTHORIZATION) String authorization, @PathParam("testHeadName") String testHeadName, TestHead newTestHead);
}

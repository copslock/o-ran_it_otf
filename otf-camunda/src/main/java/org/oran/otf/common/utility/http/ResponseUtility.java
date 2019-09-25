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


package org.oran.otf.common.utility.http;

import org.oran.otf.common.model.local.OTFApiResponse;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

public class ResponseUtility {

  public static class Build {

    public static Response okRequest() {
      return Response.ok().build();
    }

    public static Response badRequest() {
      return Response.status(400).build();
    }

    public static Response okRequestWithMessage(String msg) {
      return Response.status(200)
              .type(MediaType.APPLICATION_JSON)
              .entity(new OTFApiResponse(200, msg))
              .build();
    }

    public static Response okRequestWithObject(Object obj) {
      return Response.status(200)
              .type(MediaType.APPLICATION_JSON)
              .entity(obj)
              .build();
    }

    public static Response badRequestWithMessage(String msg) {
      return Response.status(400)
          .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(400, msg))
          .build();
    }

    public static Response internalServerError() {
      return Response.status(500).build();
    }

    public static Response internalServerErrorWithMessage(String msg) {
      return Response.status(500)
          .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(500, msg))
          .build();
    }

    public static Response unauthorized() {
      return Response.status(401).build();
    }

    public static Response unauthorizedWithMessage(String msg) {
      return Response.status(401)
          .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(401, msg))
          .build();
    }

    public static Response notFound() {
      return Response.status(404).build();
    }

    public static Response notFoundWithMessage(String msg) {
      return Response.status(404)
              .type(MediaType.APPLICATION_JSON)
              .entity(new OTFApiResponse(404, msg))
              .build();
    }

    public static Response genericWithCode(int code) {
      return Response.status(code).build();
    }

    public static Response genericWithMessage(int code, String msg) {
      return Response.status(code)
              .type(MediaType.APPLICATION_JSON)
          .entity(new OTFApiResponse(code, msg))
              .build();
    }

    public static Response genericWithObject(int code, Object obj) {
      return Response.status(code)
              .type(MediaType.APPLICATION_JSON)
              .entity(obj)
              .build();
    }
  }
}

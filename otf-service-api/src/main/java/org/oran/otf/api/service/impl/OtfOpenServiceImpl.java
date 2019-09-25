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


package org.oran.otf.api.service.impl;

import org.oran.otf.api.Utilities;
import org.oran.otf.api.Utilities.LogLevel;
import org.oran.otf.api.service.OtfOpenService;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javax.ws.rs.core.Response;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;

@Service
public class OtfOpenServiceImpl implements OtfOpenService {

  @Override
  public Response convertSwaggerFile() {
    try {
      HttpResponse res =
          Utilities.Http.httpGetUsingAAF("https://localhost:8443/otf/api/openapi.json");
      String resStr = EntityUtils.toString(res.getEntity());
      JsonObject resJson = new JsonParser().parse(resStr).getAsJsonObject();
      if (resJson.has("openapi")) {
        resJson.addProperty("openapi", "3.0.0");
        return Response.ok(resJson.toString()).build();
      }
    } catch (Exception e) {
      Utilities.printStackTrace(e, LogLevel.ERROR);
    }

    return Utilities.Http.BuildResponse.internalServerError();
  }
}

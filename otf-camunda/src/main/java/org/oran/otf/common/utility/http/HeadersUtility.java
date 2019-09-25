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

import com.google.gson.Gson;
import java.util.Map;

public class HeadersUtility {
  public static Map<String, String> maskAuth(Map<String, String> headers){
    //Deep copy headers to avoid changing original
    Gson gson = new Gson();
    String jsonString = gson.toJson(headers);
    Map<String, String> maskedHeaders = gson.fromJson(jsonString, Map.class);

    if(maskedHeaders.containsKey("Authorization")) {
      String[] auth = maskedHeaders.get("Authorization").split(" ");
      if(auth.length>1) {
        auth[1] = "****";
        maskedHeaders.put("Authorization", auth[0] + " " + auth[1]);
      }
      else{
        maskedHeaders.put("Authorization", "****");
      }
    }
    return maskedHeaders;
  }

}

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


package org.oran.otf.common.utility.gson;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import org.bson.types.ObjectId;

public class GsonUtils {
    private static final GsonBuilder gsonBuilder =
            new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
                    .registerTypeAdapter(ObjectId.class, new JsonSerializer<ObjectId>() {
                        @Override
                        public JsonElement serialize(ObjectId src, Type typeOfSrc,
                                                     JsonSerializationContext context) {
                            return new JsonPrimitive(src.toHexString());
                        }
                    }).registerTypeAdapter(ObjectId.class, new JsonDeserializer<ObjectId>() {
                @Override
                public ObjectId deserialize(JsonElement json, Type typeOfT,
                                            JsonDeserializationContext context) throws JsonParseException {
                    return new ObjectId(json.getAsString());
                }
            });

    public static Gson getGson() {
        return gsonBuilder.create();
    }

    private static final Gson gson = getGson();
    private static final Type TT_mapStringString = new TypeToken<Map<String,String>>(){}.getType();

    public static Map<String, String> jsonToMapStringString(String json) {
        Map<String, String> ret = new HashMap<String, String>();
        if (json == null || json.isEmpty())
            return ret;
        return gson.fromJson(json, TT_mapStringString);
    }
    public static String mapStringObjectToJson(Map<String, Object> map) {
        if (map == null)
            map = new HashMap<String, Object>();
        return gson.toJson(map);
    }
}
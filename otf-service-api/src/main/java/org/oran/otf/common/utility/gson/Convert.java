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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import org.bson.types.ObjectId;

public class Convert {

  private static final GsonBuilder gsonBuilder =
      new GsonBuilder()
          .setDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
          .registerTypeAdapter(
              ObjectId.class,
              new JsonSerializer<ObjectId>() {
                @Override
                public JsonElement serialize(
                    ObjectId src, Type typeOfSrc, JsonSerializationContext context) {
                  return new JsonPrimitive(src.toHexString());
                }
              })
          .registerTypeAdapter(
              ObjectId.class,
              new JsonDeserializer<ObjectId>() {
                @Override
                public ObjectId deserialize(
                    JsonElement json, Type typeOfT, JsonDeserializationContext context)
                    throws JsonParseException {
                  return new ObjectId(json.getAsString());
                }
              });

  public static Gson getGson() {
    return gsonBuilder.create();
  }

  public static String mapToJson(Map map) {
    if (map.isEmpty()) {
      return "{}";
    }
    return getGson().toJson(map);
  }

  public static Map<String, Object> jsonToMap(String json) {
    Type type = new TypeToken<HashMap<String, Object>>() {
    }.getType();
    return getGson().fromJson(json, type);
  }

  public static String objectToJson(Object obj) {
    return getGson().toJson(obj);
  }

  public static<T> T mapToObject(Map map, TypeReference<T> typeReference) throws IOException {
    return jsonToObject(mapToJson(map), typeReference);
  }

  public static <T> T jsonToObject(String json, TypeReference<T> typeReference) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
    return objectMapper.readValue(json, typeReference);
  }
}

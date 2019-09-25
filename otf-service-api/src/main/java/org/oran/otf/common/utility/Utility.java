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


package org.oran.otf.common.utility;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Utility {

  public static String getLoggerPrefix() {
    return "[" + Thread.currentThread().getStackTrace()[2].getMethodName() + "]: ";
  }

  public static Map<?, ?> toMap(Object obj) throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    return mapper.convertValue(obj, HashMap.class);
  }

  public static boolean isCollection(Object obj) {
    return obj.getClass().isArray() || obj instanceof Collection;
  }

  public static List<?> toList(Object obj) {
    if (obj == null) {
      throw new NullPointerException("Argument cannot be null.");
    }

    List<?> list = new ArrayList<>();
    if (obj.getClass().isArray()) {
      list = Arrays.asList((Object[]) obj);
    } else if (obj instanceof Collection) {
      list = new ArrayList<>((Collection<?>) obj);
    }

    return list;
  }

  public static boolean isValidUuid(String str) {
    if (Strings.isNullOrEmpty(str)) {
      return false;
    }
    try {
      UUID uuid = UUID.fromString(str);
      return uuid.toString().equalsIgnoreCase(str);
    } catch (IllegalArgumentException iae) {
      return false;
    }
  }

  // check a name type pair to see if it matches field in class
  public static boolean isTypeVariablePairInClass(String variableName, Object variableValue, Class javaClass){
    List<Field> testHeadFields = Arrays.asList(javaClass.getFields());
    for(int i = 0; i < testHeadFields.size(); i++){
      Field field = testHeadFields.get(i);
      if(field.getName().equals(variableName) && field.getType().isInstance(variableValue)){
        return true;
      }
    }
    return false;
  }
}

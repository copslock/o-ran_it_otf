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


package org.oran.otf.api;

import org.oran.otf.common.model.User;
import org.oran.otf.common.model.local.OTFApiResponse;
import org.oran.otf.common.repository.UserRepository;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.repository.MongoRepository;

public class Utilities {

  public static JsonObject parseJson(String str) {
    try {
      return new JsonParser().parse(str).getAsJsonObject();
    } catch (JsonParseException jpe) {
      logger.error("Cannot parse string as Json.");
      return null;
    }
  }

  public static class Http {
    public static class BuildResponse {
      public static Response badRequest() {
        return Response.status(400).build();
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
    }

    public static HttpResponse httpPostJsonUsingAAF(String url, String body) throws Exception {
      HttpResponse response = null;

        String aafCredentialsDecoded =
            System.getenv("AAF_ID") + ":" + System.getenv("AAF_MECH_PASSWORD");

        HttpPost post = new HttpPost(url);
        post.setHeader("Content-Type", MediaType.APPLICATION_JSON);
        post.setHeader(
            "Authorization",
            "Basic " + Base64.getEncoder().encodeToString(aafCredentialsDecoded.getBytes()));
        post.setEntity(new StringEntity(body));

        HttpClient client =
            HttpClientBuilder.create()
                .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                .build();
        response = client.execute(post);

        // logger.info(String.format("[POST:%s]\n %s", url, body));

      return response;
    }

    public static HttpResponse httpDeleteAAF(String url) {
      HttpResponse response = null;

      try {
        String aafCredentialsDecoded =
            System.getenv("AAF_ID") + ":" + System.getenv("AAF_MECH_PASSWORD");

        HttpDelete delete = new HttpDelete(url);
        delete.setHeader(
            "Authorization",
            "Basic " + Base64.getEncoder().encodeToString(aafCredentialsDecoded.getBytes()));
        HttpClient client =
            HttpClientBuilder.create()
                .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                .build();
        response = client.execute(delete);

        // logger.info(String.format("[DELETE:%s]\n", url));
      } catch (Exception e) {
        e.printStackTrace();
      }

      return response;
    }

    public static HttpResponse httpPostXmlUsingAAF(String url, String body) {
      HttpResponse response = null;

      try {
        String aafCredentialsDecoded =
            System.getenv("AAF_ID") + ":" + System.getenv("AAF_MECH_PASSWORD");

        HttpPost post = new HttpPost(url);
        post.setHeader("Content-Type", MediaType.APPLICATION_JSON);
        post.setHeader(
            "Authorization",
            "Basic " + Base64.getEncoder().encodeToString(aafCredentialsDecoded.getBytes()));
        post.setEntity(new StringEntity(body));

        List<NameValuePair> urlParameters = Arrays.asList(new BasicNameValuePair("xml", body));
        post.setEntity(new UrlEncodedFormEntity(urlParameters));

        HttpClient client = HttpClientBuilder.create().build();
        response = client.execute(post);

        logger.info(String.format("[POST:%s]\n %s", url, body));
      } catch (Exception e) {
        e.printStackTrace();
      }

      return response;
    }

    public static HttpResponse httpGetUsingAAF(String url) {
      HttpResponse response = null;

      try {
        String aafCredentialsDecoded =
            System.getenv("AAF_ID") + ":" + System.getenv("AAF_MECH_PASSWORD");

        HttpGet get = new HttpGet(url);
        get.setHeader("Content-Type", "application/json");
        get.setHeader(
            "Authorization",
            "Basic " + Base64.getEncoder().encodeToString(aafCredentialsDecoded.getBytes()));

        HttpClient client =
            HttpClientBuilder.create()
                .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                .build();
        response = client.execute(get);

        logger.info(String.format("[GET:%s]", url));
      } catch (Exception e) {
        e.printStackTrace();
      }

      return response;
    }
  }

  public static class Camunda {

    public static boolean isCamundaOnline() {
      final String healthUrl =
          String.format(
              "%s:%s/%s",
              System.getenv("otf.camunda.host"),
              System.getenv("otf.camunda.port"),
              System.getenv("otf.camunda.uri.health"));

      HttpResponse res = Utilities.Http.httpGetUsingAAF(healthUrl);
      return res != null && res.getStatusLine().getStatusCode() == 200;
    }

    public static JsonObject processInstanceStatus(String executionId) {
      // Read necessary environment variables - Avoiding using Spring dependencies (@Value)
      String host = System.getenv("otf.camunda.host");
      String path = System.getenv("otf.camunda.uri.process-instance-completion-check");
      int port = Utilities.TryGetEnvironmentVariable("otf.camunda.port");

      if (!Utilities.isHostValid(host)) {
        logger.error("Host (%s) must use either the http or https protocol.", host);
        return null;
      }

      if (!Utilities.isPortValid(port)) {
        logger.error(
            "Invalid port (%s) specified as environment variable 'otf.camunda.port'.",
            System.getenv("otf.camunda.port"));
        return null;
      }
      try {
        String getUrl = String.format("%s:%s/%s/%s", host, port, path, executionId);
        HttpResponse response = Utilities.Http.httpGetUsingAAF(getUrl);
        HttpEntity entity = response.getEntity();
        String result = EntityUtils.toString(entity);

        return parseJson(result);
      } catch (IOException ioe) {
        Utilities.printStackTrace(ioe, Utilities.LogLevel.ERROR);
        logger.error("Cannot convert http entity to String.");
      } catch (Exception e) {
        Utilities.printStackTrace(e, Utilities.LogLevel.ERROR);
      }
      // conversion was unsuccessful
      return null;
    }
  }

  private static final Logger logger = LoggerFactory.getLogger(Utilities.class);

  public static void printStackTrace(Exception exception, LogLevel logLevel) {
    String stackTrace = getStackTrace(exception);

    switch (logLevel) {
      case INFO:
        logger.info(stackTrace);
        break;
      case WARN:
        logger.warn(stackTrace);
        break;
      case DEBUG:
        logger.debug(stackTrace);
        break;
      case ERROR:
        logger.error(stackTrace);
        break;
    }
  }

  public static int TryGetEnvironmentVariable(String variable) {
    String value = System.getenv(variable);
    int result = 0x80000000;

    try {
      result = Integer.parseInt(value);
    } catch (NumberFormatException error) {
      error.printStackTrace();
      logger.error(error.getMessage());
    }

    return result;
  }

  public static String getStackTrace(Exception exception) {
    StringWriter stringWriter = new StringWriter();
    exception.printStackTrace(new PrintWriter(stringWriter));
    return stringWriter.toString();
  }

  public static boolean isObjectIdValid(String input) {
    ObjectId id = null;
    try {
      id = new ObjectId(input); // check if an ObjectId can be created from the string
      if (id.toString().equalsIgnoreCase(input)) return true;
      logger.warn("The input string does not have the same value as it's string representation.");
    } catch (IllegalArgumentException e) {
      logger.error(String.format("An ObjectId cannot be instantiated from the string: %s", input));
    }

    return false;
  }

  public static boolean isPortValid(int port) {
    return (port >= 0 && port <= 65535);
  }

  public static boolean isHostValid(String host) {
    return host.startsWith("http");
  }

  public static <T> boolean identifierExistsInCollection(
      MongoRepository<T, String> repository, ObjectId identifier) {
    return repository.findById(identifier.toString()).isPresent();
  }

  public static <T> T findByIdGeneric(MongoRepository<T, String> repository, ObjectId identifier) {
    Optional<T> optionalObj = repository.findById(identifier.toString());
    return optionalObj.orElse(null);
  }

  public static String[] decodeBase64AuthorizationHeader(String encodedHeader) {
    try {
      byte[] decodedAuthorization = Base64.getDecoder().decode(encodedHeader.replace("Basic ", ""));
      String credentials = new String(decodedAuthorization);
      return credentials.split(":");
    } catch (Exception e) {
      logger.error("Unable to decode authorization header: " + encodedHeader);
      return null;
    }
  }

  public static User findUserByMechanizedId(String mechanizedId, UserRepository userRepository) {
    Optional<User> optionalUser = userRepository.findFirstByEmail(mechanizedId);
    return optionalUser.orElse(null);
  }

  public static User findUserByAuthHeader(String authorization, UserRepository userRepository) {
    try {
      if (Strings.isNullOrEmpty(authorization)) {
        return null;
      }
      String[] credentials = Utilities.decodeBase64AuthorizationHeader(authorization);
      return findUserByMechanizedId(credentials[0], userRepository);
    } catch (Exception e) {
      return null;
    }
  }

  public static <T> T resolveOptional(Optional<T> optional) {
    return optional.orElse(null);
  }

  public static <T> T mapRequest(Class<T> targetType, String input) {
    logger.info(targetType.getName());

    ObjectMapper mapper =
        new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    try {
      return mapper.readValue(input, targetType);
    } catch (IOException e) {
      Utilities.printStackTrace(e, LogLevel.ERROR);
      return null;
    }
  }

  public enum LogLevel {
    WARN,
    DEBUG,
    INFO,
    ERROR
  }

  public static Date getCurrentDate() {
    return new Date(System.currentTimeMillis());
  }

  public static Map<String, Object> replaceObjectId(Map<String, Object> map, String objectIdKey) {
    if (map.containsKey(objectIdKey)) {
      ObjectId id = (ObjectId) map.get(objectIdKey);
      map.replace(objectIdKey, id.toString());
    }

    return map;
  }
}

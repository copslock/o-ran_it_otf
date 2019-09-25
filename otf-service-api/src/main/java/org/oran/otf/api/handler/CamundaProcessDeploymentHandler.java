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


package org.oran.otf.api.handler;

import org.oran.otf.api.Utilities;
import org.oran.otf.common.utility.http.ResponseUtility;
import java.io.InputStream;
import java.util.Base64;
import javax.ws.rs.core.Response;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class CamundaProcessDeploymentHandler {
  private static final Logger logger =
      LoggerFactory.getLogger(CamundaProcessDeploymentHandler.class);

  private CamundaProcessDeploymentHandler() {
    // prevent instantiation
  }

  public Response start(InputStream bpmn, InputStream compressedResources) {
    // Read necessary environment variables - Avoiding using Spring dependencies (@Value)
    String host = System.getenv("otf.camunda.host");
    String path = System.getenv("otf.camunda.uri.deploy-test-strategy-zip");
    int port = Utilities.TryGetEnvironmentVariable("otf.camunda.port");
    String aafCredentialsDecoded =
        System.getenv("AAF_ID") + ":" + System.getenv("AAF_MECH_PASSWORD");

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

    // Form the full url
    String postUrl = String.format("%s:%s/%s", host, port, path);

    try (CloseableHttpClient httpclient =
        HttpClients.custom().setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE).build()) {

      // build multipart upload request
      MultipartEntityBuilder builder =
          MultipartEntityBuilder.create()
              .addBinaryBody("bpmn", bpmn, ContentType.DEFAULT_BINARY, "bpmn");

      // add resources to the request if they were supplied
      if (compressedResources != null) {
        builder.addBinaryBody(
            "resources", compressedResources, ContentType.DEFAULT_BINARY, "resources");
      }

      HttpEntity data = builder.build();

      // build http request and assign multipart upload data
      HttpUriRequest request =
          RequestBuilder.post(postUrl)
              .addHeader(
                  "Authorization",
                  "Basic " + Base64.getEncoder().encodeToString(aafCredentialsDecoded.getBytes()))
              .setEntity(data)
              .build();

      System.out.println("Executing request " + request.getRequestLine());

      // Create a custom response handler
      ResponseHandler<Response> responseHandler =
          response -> {
            int status = response.getStatusLine().getStatusCode();
            if (status >= 200 && status < 300) {
              HttpEntity entity = response.getEntity();
              String message = entity != null ? EntityUtils.toString(entity) : null;
              return Response.ok(message).build();
            } else if (status == 400) {
              HttpEntity entity = response.getEntity();
              String message =
                  entity != null
                      ? EntityUtils.toString(entity)
                      : "Supplied bpmn file is not deployable.";
              return Utilities.Http.BuildResponse.badRequestWithMessage(message);
            } else {
              throw new ClientProtocolException("Unexpected response status: " + status);
            }
          };

      Response responseBody = httpclient.execute(request, responseHandler);
      System.out.println("----------------------------------------");
      System.out.println(responseBody.getEntity().toString());

      return responseBody;
    } catch (HttpHostConnectException e) {
      return ResponseUtility.Build.serviceUnavailableWithMessage(e.getMessage());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseUtility.Build.internalServerErrorWithMessage("Unable to deploy definition.");
    }
  }
}

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

import com.google.common.base.Strings;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Future;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.apache.http.protocol.BasicHttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RequestUtility {

  private static final Logger logger = LoggerFactory.getLogger(RequestUtility.class);

  public static void postAsync(String url, String body, Map<String, String> headers, Boolean proxy)
      throws Exception {
    HttpPost post = buildPost(url, body, headers);
    executeAsync(post, proxy);
  }

  public static HttpResponse postSync(
      String url, String body, Map<String, String> headers, Boolean proxy) throws Exception {
    HttpPost post = buildPost(url, body, headers);
    return executeSync(post, proxy);
  }

  public static HttpResponse postSync(
      String url, String body, Map<String, String> headers, int timeoutInMillis, Boolean proxy)
      throws Exception {
    HttpPost post = buildPost(url, body, headers);
    return executeSync(post, timeoutInMillis, proxy);
  }

  public static HttpResponse getSync(String url, Map<String, String> headers, Boolean proxy)
      throws Exception {
    HttpGet get = buildGet(url, headers);
    return executeSync(get, proxy);
  }

  public static HttpResponse getSync(
      String url, Map<String, String> headers, int timeoutInMillis, Boolean proxy)
      throws Exception {
    if (timeoutInMillis < 0) {
      throw new IllegalArgumentException("The timeoutInMillis must be a value greater than 0.");
    }

    HttpGet get = buildGet(url, headers);
    return executeSync(get, timeoutInMillis, proxy);
  }

  public static void getAsync(String url, Map<String, String> headers, Boolean proxy)
      throws Exception {
    HttpGet get = buildGet(url, headers);
    executeAsync(get, proxy);
  }

  private static HttpPost buildPost(String url, String body, Map<String, String> headers)
      throws UnsupportedEncodingException {
    if (Strings.isNullOrEmpty(url) || Strings.isNullOrEmpty(body)) {
      return null;
    } else if (headers == null) {
      headers = new HashMap<>();
    }

    HttpPost post = new HttpPost(url);
    headers.forEach(post::setHeader);
    post.setEntity(new StringEntity(body));
    return post;
  }

  private static HttpGet buildGet(String url, Map<String, String> headers) {
    if (Strings.isNullOrEmpty(url)) {
      return null;
    } else if (headers == null) {
      headers = new HashMap<>();
    }

    HttpGet get = new HttpGet(url);
    headers.forEach(get::setHeader);
    return get;
  }

  private static HttpResponse executeSync(HttpRequestBase request, Boolean proxy) throws Exception {
    CloseableHttpAsyncClient httpClient = createHttpAsyncClient();
    try {
      httpClient.start();
      Future<HttpResponse> future =
          proxy
              ? httpClient.execute(request, createHttpClientContext(), null)
              : httpClient.execute(request, null);
      return future.get();
    } catch (Exception e) {
      throw e;
    } finally {
      httpClient.close();
    }
  }

  private static HttpResponse executeSync(
      HttpRequestBase request, int timeoutInMillis, Boolean proxy) throws Exception {
    if (timeoutInMillis < 0) {
      throw new IllegalArgumentException("The timeoutInMillis must be a value greater than 0.");
    }

    // Create a timer task that will abort the task (the request) after the specified time. This
    // task will run *timeoutInMillis* ms
    TimerTask task =
        new TimerTask() {
          @Override
          public void run() {
            if (request != null) {
              request.abort();
            }
          }
        };

    CloseableHttpAsyncClient httpClient = createHttpAsyncClient();
    try {
      httpClient.start();
      // Start the timer before making the request.
      new Timer(true).schedule(task, timeoutInMillis);
      Future<HttpResponse> future =
          proxy
              ? httpClient.execute(request, createHttpClientContext(), null)
              : httpClient.execute(request, null);

      return future.get();
    } catch (Exception e) {
      throw e;
    } finally {
      httpClient.close();
    }
  }

  private static void executeAsync(HttpRequestBase request, Boolean proxy) throws Exception {
    CloseableHttpAsyncClient httpClient = createHttpAsyncClient();
    try {
      httpClient.start();
      Future<HttpResponse> future =
          proxy
              ? httpClient.execute(request, createHttpClientContext(), null)
              : httpClient.execute(request, null);
      logger.debug("Sent asynchronous request.");
    } catch (Exception e) {
      throw e;
    } finally {
      httpClient.close();
    }
  }

  private static RequestConfig configureProxy() {
    HttpHost proxy;
    proxy = new HttpHost("localhost", 8080, "http");
    return RequestConfig.custom().setProxy(proxy).build();
  }

  private static HttpClientContext createHttpClientContext() {
    HttpClientContext localContext = HttpClientContext.adapt(new BasicHttpContext());
    localContext.setRequestConfig(configureProxy());
    return localContext;
  }

  private static CloseableHttpAsyncClient createHttpAsyncClient() throws Exception {
    return HttpAsyncClients.createDefault();
  }
}

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
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RequestUtility {

  private static Logger logger = LoggerFactory.getLogger(RequestUtility.class);

  public static void postAsync(String url, String body, Map<String, String> headers)
      throws IOException, InterruptedException, ExecutionException {
    HttpPost post = buildPost(url, body, headers);
    executeAsync(post);
  }

  public static HttpResponse postSync(String url, String body, Map<String, String> headers)
      throws IOException, InterruptedException, ExecutionException {
    HttpPost post = buildPost(url, body, headers);
    return executeSync(post);
  }

  public static HttpResponse postSync(
      String url, String body, Map<String, String> headers, int timeoutInMillis)
      throws IOException, InterruptedException, ExecutionException {
    HttpPost post = buildPost(url, body, headers);
    return executeSync(post, timeoutInMillis);
  }

  public static HttpResponse getSync(String url, Map<String, String> headers)
      throws IOException, InterruptedException, ExecutionException {
    HttpGet get = buildGet(url, headers);
    return executeSync(get);
  }

  public static HttpResponse getSync(String url, Map<String, String> headers, int timeoutInMillis)
      throws IOException, InterruptedException, ExecutionException {
    if (timeoutInMillis < 0) {
      throw new IllegalArgumentException("The timeoutInMillis must be a value greater than 0.");
    }

    HttpGet get = buildGet(url, headers);
    return executeSync(get, timeoutInMillis);
  }

  public static void getAsync(String url, Map<String, String> headers) throws IOException {
    HttpGet get = buildGet(url, headers);
    executeAsync(get);
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

  private static HttpResponse executeSync(HttpRequestBase request)
      throws IOException, InterruptedException, ExecutionException {
    CloseableHttpAsyncClient httpClient = HttpAsyncClients.createDefault();
    try {
      httpClient.start();
      Future<HttpResponse> future = httpClient.execute(request, null);
      return future.get();
    } finally {
      httpClient.close();
    }
  }

  private static HttpResponse executeSync(HttpRequestBase request, int timeoutInMillis)
      throws IOException, InterruptedException, ExecutionException {
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

    CloseableHttpAsyncClient httpClient = HttpAsyncClients.createDefault();
    try {
      httpClient.start();
      // Start the timer before making the request.
      new Timer(true).schedule(task, timeoutInMillis);
      Future<HttpResponse> future = httpClient.execute(request, null);
      return future.get();
    } finally {
      httpClient.close();
    }
  }

  private static void executeAsync(HttpRequestBase request) throws IOException {
    CloseableHttpAsyncClient httpClient = HttpAsyncClients.createDefault();
    try {
      httpClient.start();
      httpClient.execute(request, null);
      logger.debug("Sent asynchronous request.");
    } finally {
      httpClient.close();
    }
  }
}

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


package org.oran.otf.api.tests.integration.services;

import org.oran.otf.api.Application;
import org.oran.otf.api.tests.shared.MemoryDatabase;
import io.restassured.RestAssured;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    classes = {Application.class}
)
@TestPropertySource("classpath:application-test.properties")
@ActiveProfiles("test")
public class StrategyServiceRouteIT {
  @LocalServerPort
  private int port;
  @BeforeClass
  public static void setup() throws Exception{
    MemoryDatabase.setup();
  }
  @AfterClass
  public static void cleanup(){
    MemoryDatabase.cleanup();
  }
  @Before
  public void setupRestAssured(){
    RestAssured.port = port;
    RestAssured.baseURI="https://localhost";
    RestAssured.basePath="/otf/api/testStrategy";
    RestAssured.urlEncodingEnabled=false;
    RestAssured.useRelaxedHTTPSValidation();
  }

  @Test
  public void testStrategyServiceRouteDeployRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").post("/deploy/v1").then().assertThat().statusCode(401);
  }
  @Test
  public void testStrategyServiceRouteDeleteByTestDefinitionIdRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").delete("/delete/v1/testDefinitionId/56565656").then().assertThat().statusCode(401);
  }
  @Test
  public void testStrategyServiceRouteDeleteByDeploymentIdRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").delete("/delete/v1/deploymentId/54545454").then().assertThat().statusCode(401);
  }

}

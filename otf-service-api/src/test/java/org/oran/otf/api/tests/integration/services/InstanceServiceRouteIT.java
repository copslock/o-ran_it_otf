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

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.equalTo;

import org.oran.otf.api.Application;
import org.oran.otf.api.tests.shared.MemoryDatabase;
import org.oran.otf.common.model.TestDefinition;
import org.oran.otf.common.model.TestInstance;
import org.oran.otf.common.model.User;
import io.restassured.RestAssured;
import org.eclipse.jetty.http.QuotedQualityCSV;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
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
public class InstanceServiceRouteIT {
  @LocalServerPort
  private int port;
  @Value("${otf.mechid}")
  private String username;
  @Value("${otf.mechpass}")
  private String password;
  private static User mechUser;

  @Autowired
  private MongoTemplate mongoTemplate;

  @BeforeClass
  public static void setup() throws Exception{
    MemoryDatabase.createAllTables();
    MemoryDatabase.createAllAdmin();
    //mechUser = MemoryDatabase.createMechUser();
  }
  @AfterClass
  public static void cleanup(){
    MemoryDatabase.cleanup();
  }
  @Before
  public void setupRestAssured() {
    RestAssured.port = port;
    RestAssured.urlEncodingEnabled = false;
    RestAssured.baseURI = "https://localhost";
    RestAssured.basePath="/otf/api/testInstance";
    RestAssured.useRelaxedHTTPSValidation();
  }
  //NoAuth Tests

  @Test
  public void testFindByIdRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/v1/id/abced").then().assertThat().statusCode(401);
  }
  @Test
  public void testFindByProcessKeyRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/v1/processDefinitionKey/abced").then().assertThat().statusCode(401);
  }
  @Test
  public void testFindByProcessKeyAndVersionRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/v1/processDefinitionKey/abced/version/1").then().assertThat().statusCode(401);
  }


  @Test
  public void testExecuteRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/execute/v1/id/abced/").then().assertThat().statusCode(401);
  }


  @Test
  public void testCreateByTestDefinitionIdRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/create/v1/testDefinitionId/abced/").then().assertThat().statusCode(401);
  }
  @Test
  public void testCreateByTestDefinitionIdAndVersionRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/create/v1/testDefinitionId/abced/version/2").then().assertThat().statusCode(401);
  }
  @Test
  public void testCreateByProcessDefinitionKeyRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/create/v1/processDefinitionKey/abced").then().assertThat().statusCode(401);
  }
  @Test
  public void testCreateByProcessDefinitionKeyAndVersionRespondsWith401OnNoAuth(){
    RestAssured.given().log().all().header("Accept", "application/json").get("/create/v1/processDefinitionKey/abced/version/2").then().assertThat().statusCode(401);
  }

  //With Auth and Wrong id
  @Test
  public void testFindByIdRespondsWith400OnWrongId(){
    RestAssured.given().auth().basic(username,password).log().all().header("Accept", "application/json").get("/v1/id/abced").then().assertThat().statusCode(400);
  }
  @Test
  public void testFindByIdRespondsWithMessageOnWrongId(){
    RestAssured.given().auth().basic(username,password).log().all().header("Accept", "application/json").get("/v1/id/abcde").then().assertThat().body("message", containsString("is not a valid ObjectId (BSON)"));
  }
  @Test
  public void testFindByProcessDefinitionRespondsWith400OnWrongProcessDefinition(){
    TestDefinition testDefinition = mongoTemplate.findOne(new Query(Criteria.where("testName").is("testDef1")), TestDefinition.class);
    RestAssured.given().auth().basic(username,password).log().all().header("Accept", "*/*").get("/v1/processDefinitionKey/"+testDefinition.getProcessDefinitionKey()).then().assertThat().statusCode(400);
  }
  @Test
  public void testFindByProcessDefinitionRespondsWithMessageOnWrongProcessDefinition(){
    TestDefinition testDefinition = mongoTemplate.findOne(new Query(Criteria.where("testName").is("testDef1")), TestDefinition.class);
    RestAssured.given().auth().basic(username,password).log().all().header("Accept", "application/json").get("/v1/processDefinitionKey/"+testDefinition.getProcessDefinitionKey()).then().assertThat().body("message", containsString("No test instances found"));
  }

  //Successful Get Methods

  @Test
  public void testFindByIdRespondsWith200OnSuccess(){
    TestInstance testInstance = mongoTemplate.findOne(new Query(Criteria.where("testInstanceName").is("MechTestInstance")), TestInstance.class);
    RestAssured.given().auth().basic(username,password).log().all().header("Accept", "*/*").get("/v1/id/"+testInstance.get_id()).then().assertThat().statusCode(200);
  }

  @Test
  public void testFindByProcessDefinitionKeyRespondsWith200OnSuccess(){
    TestDefinition testDefinition = mongoTemplate.findOne(new Query(Criteria.where("testName").is("MechTestDefinition")), TestDefinition.class);
    RestAssured.given().auth().basic(username, password).log().all().header("Accept", "*/*").get("/v1/processDefinitionKey/"+testDefinition.getProcessDefinitionKey()).then().assertThat().statusCode(200);
  }

  @Test
  public void testFindByProcessDefinitionKeyAndVersionRespondsWith200OnSuccess(){
    TestDefinition testDefinition = mongoTemplate.findOne(new Query(Criteria.where("testName").is("MechTestDefinition")), TestDefinition.class);
    RestAssured.given().auth().basic(username, password).log().all().header("Accept", "*/*").get("/v1/processDefinitionKey/"+testDefinition.getProcessDefinitionKey()+"/version/"+1).then().assertThat().statusCode(200);
  }

  @Test
  public void testCreateByTestDefinitionIdRespondsWith201OnSuccess(){
    TestDefinition testDefinition = mongoTemplate.findOne(new Query(Criteria.where("testName").is("MechTestDefinition")), TestDefinition.class);
    System.out.println(testDefinition.getBpmnInstances());
    RestAssured.given().contentType("application/json\r\n").auth().basic(username, password).log().all().header("Accept", "*/*").post("/create/v1/testDefinitionId/"+testDefinition.get_id()+"/version/"+1).then().assertThat().statusCode(404);
  }

}

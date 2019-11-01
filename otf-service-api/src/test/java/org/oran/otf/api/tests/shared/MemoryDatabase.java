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


package org.oran.otf.api.tests.shared;

import org.oran.otf.common.model.*;
import org.oran.otf.common.model.local.BpmnInstance;
import org.oran.otf.common.model.local.UserGroup;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import de.flapdoodle.embed.mongo.Command;
import de.flapdoodle.embed.mongo.MongodExecutable;
import de.flapdoodle.embed.mongo.MongodProcess;
import de.flapdoodle.embed.mongo.MongodStarter;
import de.flapdoodle.embed.mongo.config.DownloadConfigBuilder;
import de.flapdoodle.embed.mongo.config.ExtractedArtifactStoreBuilder;
import de.flapdoodle.embed.mongo.config.IMongodConfig;
import de.flapdoodle.embed.mongo.config.MongodConfigBuilder;
import de.flapdoodle.embed.mongo.config.Net;
import de.flapdoodle.embed.mongo.config.RuntimeConfigBuilder;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.mongo.distribution.Version.Main;
import de.flapdoodle.embed.process.config.IRuntimeConfig;
import de.flapdoodle.embed.process.config.store.HttpProxyFactory;
import de.flapdoodle.embed.process.runtime.Network;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Random;
import javassist.util.proxy.ProxyFactory;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.oran.otf.common.model.*;
import org.springframework.context.annotation.Configuration;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.test.context.ActiveProfiles;


@ActiveProfiles("test")
public abstract class MemoryDatabase {
  protected static MongodExecutable mongodExecutable;
  protected static MongoTemplate mongoTemplate;

  //TODO use mongod process to be response from mongodExecutable.start(), on pulbic calls check if null if so call setup else dont
  protected static MongodProcess mongod = null;

  protected static Query userQuery = new Query(Criteria.where("firstName").is("Mech"));
  //protected static Query mechUserQuery = new Query(Criteria.where("firstName").is("Mech"));
  protected static Query testInstanceQuery = new Query(Criteria.where("testInstanceName").is("MechTestInstance"));
  protected static Query groupQuery = new Query(Criteria.where("groupName").is("MechGroup"));
  protected static Query testDefQuery = new Query(Criteria.where("testName").is("MechTestDefinition"));

  //values should match with DataConfig2
  protected static int port=5555;
  protected static String host="localhost";


  public static void setup()throws Exception{
    Command command = Command.MongoD;
    IRuntimeConfig runtimeConfig = new RuntimeConfigBuilder()
        .defaults(command)
        .artifactStore(new ExtractedArtifactStoreBuilder()
            .defaults(command)
            .download(new DownloadConfigBuilder()
                .defaultsForCommand(command)
                .proxyFactory(new HttpProxyFactory("localhost",8080))))
             .build();

    //String host = "localhost";
    //int port = 5555;

    IMongodConfig mongodConfig = new MongodConfigBuilder().version(Main.PRODUCTION)
        .net(new Net(host, port, Network.localhostIsIPv6()))
        .build();
    //MongodStarter starter = MongodStarter.getDefaultInstance();
    MongodStarter starter = MongodStarter.getInstance(runtimeConfig);
    mongodExecutable = starter.prepare(mongodConfig);
    mongodExecutable.start();
    mongoTemplate = new MongoTemplate(new MongoClient(host, port), "test");

    DBObject objectToSave = BasicDBObjectBuilder.start()
        .add("name", "john")
        .get();
    mongoTemplate.save(objectToSave, "collection");


  }
  /*
  public static User createMechUser(){

    User user = mongoTemplate.findOne(mechUserQuery, User.class);
    if(user == null) {
      user = new User();
      user.setFirstName("Mech");
      user.setLastName("Id");
      user.setEmail("email@localhost");
      mongoTemplate.save(user, "users");
      user = mongoTemplate.findOne(mechUserQuery, User.class);
    }
    return user;
  }

   */
  //TODO: make admin user be the mechid, this is because of AAF test will fail if random user is used
  private static User createMechUserIfNotExists(){
    User user = mongoTemplate.findOne(userQuery, User.class);
    if(user == null) {
      user = new User();
      user.setFirstName("Mech");
      user.setLastName("Id");
      user.setEmail(System.getenv("AAF_ID"));
      mongoTemplate.save(user, "users");
      user = mongoTemplate.findOne(userQuery, User.class);
    }
    return user;

  }
  private static Group createMechGroupIfNotExists(){
    User user = MemoryDatabase.createMechUserIfNotExists();
    Group group = mongoTemplate.findOne(groupQuery, Group.class);
    if(group == null) {
      String groupName = "MechGroup";
      group = new Group();
      group.setOwnerId(user.get_id());
      group.setGroupName(groupName);
      group.setGroupDescription(groupName + " description");
      mongoTemplate.save(group, "groups");
      group = mongoTemplate.findOne(groupQuery, Group.class);
    }
    return group;
  }
  private static TestDefinition createMechTestDefinitionIfNotExists(){
    TestDefinition testDefinition = mongoTemplate.findOne(testDefQuery, TestDefinition.class);
    if(testDefinition == null){

      BpmnInstance bpmnInstance = new BpmnInstance();
      bpmnInstance.setDeployed(true);
      bpmnInstance.setVersion(1);
      List list = new ArrayList(Arrays.asList(bpmnInstance));

      testDefinition = new TestDefinition();
      testDefinition.setDisabled(false);
      testDefinition.setBpmnInstances(list);
      testDefinition.setTestName("MechTestDefinition");
      testDefinition.setTestDescription("MechTestDefinition description");
      testDefinition.setProcessDefinitionKey("MechTestDefinitionKey");
      testDefinition.setCreatedBy(createMechUserIfNotExists().get_id());
      testDefinition.setGroupId(createMechGroupIfNotExists().get_id());
      testDefinition.setCreatedAt(new Timestamp(new Date().getTime()));
      testDefinition.setUpdatedAt(new Timestamp(new Date().getTime()));
      mongoTemplate.save(testDefinition, "testDefinitions");
      testDefinition = mongoTemplate.findOne(testDefQuery, TestDefinition.class);
    }
    return testDefinition;

  }


  private static TestInstance createMechTestInstanceIfNotExists(){
    TestInstance testInstance = mongoTemplate.findOne(testInstanceQuery, TestInstance.class);
    User user = createMechUserIfNotExists();
    UserGroup userGroup = new UserGroup();
    if(testInstance == null){
      testInstance = new TestInstance();
      testInstance.setTestInstanceName("MechTestInstance");
      testInstance.setTestInstanceDescription("MechTestInstance description");
      testInstance.setCreatedBy(user.get_id());
      testInstance.setGroupId(createMechGroupIfNotExists().get_id());
      testInstance.setTestDefinitionId(createMechTestDefinitionIfNotExists().get_id());
      testInstance.setMaxExecutionTimeInMillis(new Random().nextInt(5000));
      testInstance.setUseLatestTestDefinition(true);
      mongoTemplate.save(testInstance, "testInstances");
      testInstance = mongoTemplate.findOne(testInstanceQuery, TestInstance.class);
    }
    userGroup.setGroupId(testInstance.getGroupId());
    userGroup.setPermissions(Arrays.asList("Admin"));
    user.setGroups(Arrays.asList(userGroup));
    mongoTemplate.save(user, "users");
    return testInstance;
  }

  public static void createGroups(){

    MemoryDatabase.createMechUserIfNotExists();
    List<String> groupNames = new ArrayList<>(Arrays.asList("Group1", "Group2", "Group3", "Group4", "Group5"));
    groupNames.forEach(name->{
      Group group = new Group();
      User usr = mongoTemplate.findOne(userQuery, User.class);
      group.setOwnerId(usr.get_id());
      group.setGroupName(name);
      group.setGroupDescription(name + " description");
      mongoTemplate.save(group, "groups");
    });

  }

  public static void createGroupsForPermission()
  {
    Group parentGroup = new Group();
    Group firstChildGroup = new Group();
    Group childOfChildGroup = new Group();
    parentGroup.setGroupName("parent group");
    firstChildGroup.setGroupName("first child group");
    childOfChildGroup.setGroupName("child of child group");
    Role adminRole = new Role();
    Role devRole = new Role();
    Role executorRole = new Role();
    GroupMember parentMember = new GroupMember();
    GroupMember firstChildMember = new GroupMember();
    GroupMember childOfChildMember = new GroupMember();
    //set up members
    createUsers();
    List<User> users = mongoTemplate.findAll(User.class,"users"); // this should be atleast 3 users
    /*
    set up
    parent group -> members only with admin roles. Permission = "READ","WRITE","MANAGEMENT"
    child group -> members only with admin and dev roles. Permission = "READ","WRITE", "MANAGEMENT
    child of child group -> members with only executor roles. Permission = "EXECUTE
     */
    parentMember.setUserId(users.get(0).get_id());
    parentMember.setRoles(Arrays.asList("admin"));
    firstChildMember.setUserId(users.get(1).get_id());
    firstChildMember.setRoles(Arrays.asList("dev","admin"));
    childOfChildMember.setUserId(users.get(2).get_id());
    childOfChildMember.setRoles(Arrays.asList("executor"));
    //set up roles
    adminRole.setRoleName("admin");
    adminRole.setPermissions(Arrays.asList("READ","WRITE","MANAGEMENT"));
    devRole.setRoleName("dev");
    devRole.setPermissions(Arrays.asList("READ","WRITE"));
    executorRole.setRoleName("executor");
    executorRole.setPermissions(Arrays.asList("EXECUTE"));
    List<Role> defaultRoles = new ArrayList<>();
    defaultRoles.add(devRole);
    defaultRoles.add(adminRole);
    defaultRoles.add(executorRole);
    //set up groups
    parentGroup.setRoles(defaultRoles);
    parentGroup.setMembers(Arrays.asList(parentMember));
    firstChildGroup.setRoles(defaultRoles);
    firstChildGroup.setMembers(Arrays.asList(firstChildMember));
    childOfChildGroup.setRoles(defaultRoles);
    childOfChildGroup.setMembers(Arrays.asList(childOfChildMember));
    /*
      set up parent tree
      structure:
      parentGroup
          |
      Child group
          |
      Child of child group
     */
    mongoTemplate.save(parentGroup,"groups");
    mongoTemplate.save(firstChildGroup,"groups");
    mongoTemplate.save(childOfChildGroup,"groups");
    // query object so we can get the object id and set up parent ids
    Query parentQ = new Query(Criteria.where("groupName").is("parent group"));
    Query firstChildQ = new Query(Criteria.where("groupName").is("first child group"));
    Query childOfChildQ = new Query(Criteria.where("groupName").is("child of child group"));
    Group parentGroupDbObj = mongoTemplate.findOne(parentQ,Group.class);
    Group firstChildDbObj = mongoTemplate.findOne(firstChildQ,Group.class);
    Group childOfChildDbObj = mongoTemplate.findOne(childOfChildQ,Group.class);

    firstChildDbObj.setParentGroupId(parentGroupDbObj.get_id());
    childOfChildDbObj.setParentGroupId(firstChildDbObj.get_id());
    mongoTemplate.save(firstChildDbObj);
    mongoTemplate.save(childOfChildDbObj);
  }

  public static void createUsers(){
    List<String> usersFirstNames = new ArrayList<>(Arrays.asList("Joe", "Jim", "Rick", "David", "Tony"));
    List<String> usersLastNames = new ArrayList<>(Arrays.asList("Terry", "Roll", "Luis", "Perry"));
      usersFirstNames.forEach(name->{
        User user = new User();
        int index = new Random().nextInt(usersFirstNames.size()-1);
        user.setEmail(name+usersLastNames.get(index)+"@email.com");
        user.setLastName(name);
        user.setFirstName(usersLastNames.get(index));
        mongoTemplate.save(user, "users");
    });

  }
  public static void createTeatHeads(){
    List<String> testheadNames = new ArrayList<>(Arrays.asList("SSH", "FTP", "PING", "PROCESS", "daRudeSandstorm"));
    testheadNames.forEach(name->{
      String random = Integer.toString(new Random().nextInt(4000)+4000);
      TestHead testHead = new TestHead();
      testHead.setTestHeadName(name);
      testHead.setTestHeadDescription(name+" virtual test head ");
      testHead.setPort(random);
      testHead.setResourcePath("resources.vths.com/"+name);
      testHead.setHostname("resources.vths.com");
      testHead.setGroupId(createMechUserIfNotExists().get_id());
      testHead.setGroupId(createMechGroupIfNotExists().get_id());
      testHead.setCreatedAt(new Timestamp(new Date().getTime()));
      testHead.setUpdatedAt(new Timestamp(new Date().getTime()));
      mongoTemplate.save(testHead, "testHeads");

    });
  }
  public static void createTestDefinitions(){
    List<String> testDefinitionNames = new ArrayList<>(Arrays.asList("testDef1", "testDef2", "testDef3", "testDef4"));
    testDefinitionNames.forEach(name->{
      TestDefinition testDefinition = new TestDefinition();
      testDefinition.setDisabled(false);
      testDefinition.setTestName(name);
      testDefinition.setTestDescription(name+" description");
      testDefinition.setProcessDefinitionKey(name+"key");
      testDefinition.setCreatedBy(createMechUserIfNotExists().get_id());
      testDefinition.setGroupId(createMechGroupIfNotExists().get_id());
      testDefinition.setCreatedAt(new Timestamp(new Date().getTime()));
      testDefinition.setUpdatedAt(new Timestamp(new Date().getTime()));
      mongoTemplate.save(testDefinition, "testDefinitions");
    });
  }
  public static void createTestInstances(){
    List<String> testInstanceName = new ArrayList<>(Arrays.asList("TestInstance1", "TestInstance2", "TestInstance3", "TestInstance4"));
    testInstanceName.forEach(name->{
      TestInstance testInstance = new TestInstance();
      testInstance.setTestInstanceName(name);
      testInstance.setTestInstanceDescription(name+" description");
      testInstance.setCreatedBy(createMechUserIfNotExists().get_id());
      testInstance.setGroupId(createMechGroupIfNotExists().get_id());
      testInstance.setTestDefinitionId(createMechTestDefinitionIfNotExists().get_id());
      testInstance.setMaxExecutionTimeInMillis(new Random().nextInt(5000));
      testInstance.setUseLatestTestDefinition(true);
      mongoTemplate.save(testInstance, "testInstances");
    });
  }

  public static void createTestExecutions(){
    List<String> results = new ArrayList<>(Arrays.asList("COMPLETED", "FAILED", "PASSED", "INCOMPLETE"));
    results.forEach(result->{
      TestExecution testExecution = new TestExecution();
      testExecution.setAsync(false);
      testExecution.setExecutorId(createMechUserIfNotExists().get_id());
      testExecution.setGroupId(createMechGroupIfNotExists().get_id());
      testExecution.setStartTime(new Timestamp(new Date().getTime()));
      testExecution.setEndTime(new Timestamp(DateUtils.addHours(new Date(),3).getTime()));
      testExecution.setTestResult(result);
      testExecution.setTestResultMessage("Process result is: "+ result);
      mongoTemplate.save(testExecution, "testExecutions");
    });
  }

  public static void createAllAdmin(){
    createMechTestDefinitionIfNotExists();
    createMechTestInstanceIfNotExists();
  }

  public static void createAllTables()throws Exception{
    setup();
    createUsers();
    createGroups();
    createTeatHeads();
    createTestDefinitions();
    createTestInstances();
    createTestExecutions();
  }

  public static void cleanup(){
    mongodExecutable.stop();
  }

}

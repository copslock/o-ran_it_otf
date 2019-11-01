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


package org.oran.otf.api.config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "org.oran.otf.common.repository")
@Profile("!test")
public class DataConfig extends AbstractMongoConfiguration {

  @Value("${otf.mongo.hosts}")
  private String hosts;

  @Value("${otf.mongo.username}")
  private String username;

  @Value("${otf.mongo.password}")
  private String password;

  @Value("${otf.mongo.replicaSet}")
  private String replicaSet;

  @Value("${otf.mongo.database}")
  private String database;

  public DataConfig() {}

  @Override
  protected String getDatabaseName() {
    return database;
  }

  @Override
  public MongoClient mongoClient() {
    MongoCredential credential =
        MongoCredential.createScramSha1Credential(username, database, password.toCharArray());

    MongoClientOptions options =
        MongoClientOptions.builder().sslEnabled(true).build();

    String[] hostArray = hosts.split(",");
    ArrayList<ServerAddress> hosts = new ArrayList<>();

    for (String host : hostArray) {
      String[] hostSplit = host.split(":");
      hosts.add(new ServerAddress(hostSplit[0], Integer.parseInt(hostSplit[1])));
    }

    return new MongoClient(hosts, credential, options);
  }

  @Override
  @Bean
  public MongoTemplate mongoTemplate() {
    return new MongoTemplate(mongoClient(), database);
  }
}

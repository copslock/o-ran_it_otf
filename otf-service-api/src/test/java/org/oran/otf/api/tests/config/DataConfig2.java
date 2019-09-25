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


package org.oran.otf.api.tests.config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import de.flapdoodle.embed.mongo.Command;
import de.flapdoodle.embed.mongo.MongodExecutable;
import de.flapdoodle.embed.mongo.MongodStarter;
import de.flapdoodle.embed.mongo.config.DownloadConfigBuilder;
import de.flapdoodle.embed.mongo.config.ExtractedArtifactStoreBuilder;
import de.flapdoodle.embed.mongo.config.IMongodConfig;
import de.flapdoodle.embed.mongo.config.MongodConfigBuilder;
import de.flapdoodle.embed.mongo.config.Net;
import de.flapdoodle.embed.mongo.config.RuntimeConfigBuilder;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.process.config.IRuntimeConfig;
import de.flapdoodle.embed.process.config.store.HttpProxyFactory;
import de.flapdoodle.embed.process.runtime.Network;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;


@Configuration
@EnableMongoRepositories(basePackages = "org.oran.otf.common.repository")
@Profile("test")
public class DataConfig2 extends AbstractMongoConfiguration {

  @Value("${otf.embedded.host}")
  private String host;

  @Value("${otf.embedded.port}")
  private int port;


  @Value("${otf.embedded.database}")
  private String database;

  public DataConfig2(){
  }

  @Override
  protected String getDatabaseName() {
    return database;
  }

  /*
  @Override
  public MongoClient mongoClient() {
    MongoCredential credential = MongoCredential.createScramSha1Credential(username, database, password.toCharArray());

    MongoClientOptions options = MongoClientOptions
        .builder()
        .sslEnabled(false)
        .requiredReplicaSetName(replicaSet)
        .build();

    String[] hostArray = hosts.split(",");
    ArrayList<ServerAddress> hosts = new ArrayList<>();

    for (String host : hostArray) {
      String[] hostSplit = host.split(":");
      hosts.add(new ServerAddress(hostSplit[0], Integer.parseInt(hostSplit[1])));
    }

    return new MongoClient(hosts, credential, options);
  }

  @Override
  public @Bean
  MongoTemplate mongoTemplate() {
    return new MongoTemplate(mongoClient(), database);
  }
*/

  @Override
  public MongoClient mongoClient(){
    return new MongoClient();
  }

  @Override
  public @Bean MongoTemplate mongoTemplate(){
    return new MongoTemplate(new MongoClient(host, port), "test");
  }

}


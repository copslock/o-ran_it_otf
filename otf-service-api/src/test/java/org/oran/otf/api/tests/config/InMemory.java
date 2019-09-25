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

import de.flapdoodle.embed.mongo.Command;
import de.flapdoodle.embed.mongo.MongodExecutable;
import de.flapdoodle.embed.mongo.MongodStarter;
import de.flapdoodle.embed.mongo.config.DownloadConfigBuilder;
import de.flapdoodle.embed.mongo.config.ExtractedArtifactStoreBuilder;
import de.flapdoodle.embed.mongo.config.IMongodConfig;
import de.flapdoodle.embed.mongo.config.MongodConfigBuilder;
import de.flapdoodle.embed.mongo.config.Net;
import de.flapdoodle.embed.mongo.config.RuntimeConfigBuilder;
import de.flapdoodle.embed.mongo.distribution.Version.Main;
import de.flapdoodle.embed.process.config.IRuntimeConfig;
import de.flapdoodle.embed.process.config.store.HttpProxyFactory;
import de.flapdoodle.embed.process.runtime.Network;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class InMemory {
  @Autowired MongodStarter mongodStarter;

  @Bean
  public MongodStarter mongodStarter(){
    Command command = Command.MongoD;
    IRuntimeConfig runtimeConfig = new RuntimeConfigBuilder()
        .defaults(command)
        .artifactStore(new ExtractedArtifactStoreBuilder()
            .defaults(command)
            .download(new DownloadConfigBuilder()
                .defaultsForCommand(command)
                //.downloadPath("http://fastdl.mongodb.org/win32/")
                .proxyFactory(new HttpProxyFactory("localhost",8080))))
             .build();

    MongodStarter starter = MongodStarter.getInstance(runtimeConfig);

    return MongodStarter.getInstance(runtimeConfig);
  }
  @Bean
  public MongodExecutable mongodExecutable()throws Exception{
    IMongodConfig mongodConfig = new MongodConfigBuilder().version(Main.PRODUCTION)
        .net(new Net("localhost", 5555, Network.localhostIsIPv6()))
        .build();
    //MongodStarter starter = MongodStarter.getDefaultInstance();
    return mongodStarter.prepare(mongodConfig);

  }

}

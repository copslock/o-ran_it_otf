#   Copyright (c) 2019 AT&T Intellectual Property.                             #
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
################################################################################

FROM openjdk:8

ENV ENV=development
ENV NAMESPACE=namespace
ENV APP_NAME=otf-camunda
ENV EXECUTORS_ACTIVE=true
ENV OTF_MONGO_USERNAME=username
ENV OTF_MONGO_PASSWORD=password
ENV OTF_MONGO_HOSTS=localhost:27017
ENV OTF_MONGO_REPLICASET=rs0
ENV OTF_MONGO_DATABASE=otf
ENV OTF_CAMUNDA_DB_URL=localhost:3306/camunda
ENV OTF_CAMUNDA_DB_USERNAME=root
ENV OTF_CAMUNDA_DB_PASSWORD=password
ENV AAF_PERM_TYPE=type
ENV CADI_HOSTNAME=localhost
ENV AAF_ID=username
ENV AAF_MECH_PASSWORD=password
ENV AAF_PASSWORD=password
ENV CADI_KEYFILE=/opt/secret/keyfile
ENV OTF_CERT_PATH=opt/cert/cert.p12
ENV OTF_CERT_PASS=password
ENV APP_VERSION=1.0
ENV PRIVATE_KEY=opt/cert/cert.key
ENV PRIVATE_KEY_USERNAME=username
ENV PRIVATE_KEY_PASSPHRASE=password

RUN apt update
RUN apt install maven -y
COPY settings.xml settings.xml
COPY src src
COPY pom.xml pom.xml
RUN mvn clean install -s settings.xml -DskipTests
RUN rm /usr/share/maven/lib/*
RUN ls
RUN mkdir -p /otf/logs
RUN mv target/otf-camunda.jar app.jar
RUN rm -r target

ENTRYPOINT ["java", "-jar", "app.jar"]

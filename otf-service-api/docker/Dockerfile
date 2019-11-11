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

ENV NAMESPACE=namespace
ENV APP_NAME=otf-service-api
ENV AAF_PERM_TYPE=type
ENV AAF_ID=username
ENV AAF_MECH_PASSWORD=password
ENV AAF_PASSWORD=password
ENV CADI_KEYFILE=/opt/secret/keyfile
ENV CADI_HOSTNAME=localhost
ENV APP_VERSION=1.0
ENV OTF_MONGO_HOSTS=localhost:27017
ENV OTF_MONGO_USERNAME=username
ENV OTF_MONGO_PASSWORD=password
ENV OTF_MONGO_REPLICASET=rs0
ENV OTF_MONGO_DATABASE=otf
ENV otf.camunda.host=http://localhost
ENV otf.camunda.port=8080
ENV otf.camunda.executionUri=otf/tcu/execute-test/v1
ENV otf.camunda.pollingUri=otf/tcu/process-instance-completion-check/v1
ENV otf.camunda.deploymentUri=otf/tcu/deploy-test-strategy-zip/v1
ENV otf.camunda.processDefinitionKeyUri=rest/process-definition/key
ENV otf.camunda.deploymentDeletionUri=otf/tcu/delete-test-strategy/v1/deployment-id
ENV otf.camunda.testDefinitionDeletionUri=otf/tcu/delete-test-strategy/v1/test-definition-id
ENV otf.camunda.uri.execute-test=otf/tcu/execute/workflowRequest
ENV otf.camunda.uri.process-instance-completion-check=otf/tcu/process-instance-completion-check/v1
ENV otf.camunda.uri.deploy-test-strategy-zip=otf/tcu/deploy-test-strategy-zip/v1
ENV otf.camunda.uri.process-definition=rest/process-definition/key
ENV otf.camunda.uri.delete-test-strategy=otf/tcu/delete-test-strategy/v1/deployment-id
ENV otf.camunda.uri.delete-test-strategy-test-definition-id=otf/tcu/delete-test-strategy/v1/test-definition-id
ENV otf.camunda.uri.health=/otf/health/v1
ENV otf.api.poll-interval=6000
ENV otf.api.poll-attempts=50
ENV OTF_CERT_PATH=opt/cert/cert.p12
ENV OTF_CERT_PASS=password

RUN apt update
RUN apt install maven -y
COPY settings.xml settings.xml
COPY src src
COPY pom.xml pom.xml
RUN mvn clean install -s settings.xml -DskipTests
RUN rm /usr/share/maven/lib/*
RUN ls
RUN mkdir -p /otf/logs
RUN mv target/otf-service-api.jar app.jar
RUN rm -r target

ENTRYPOINT ["java", "-jar", "app.jar"]

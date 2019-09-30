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
ENV otf.camunda.host=https://localhost
ENV otf.camunda.port=31313
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

COPY otf-service-api.jar app.jar

RUN mkdir -p /otf/logs

ADD src src

ENTRYPOINT ["java", "-jar", "app.jar"]

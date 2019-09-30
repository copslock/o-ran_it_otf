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

COPY otf-camunda.jar app.jar

RUN mkdir -p /otf/logs

ADD src src

ENTRYPOINT ["java", "-jar", "app.jar"]
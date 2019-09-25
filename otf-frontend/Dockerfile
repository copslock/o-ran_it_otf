FROM node:8.16-alpine

ENV ENV=development
ENV NAMESPACE=namespace
ENV APP_NAME=otf-frontend
ENV APP_VERSION=1.0
ENV OTF_URL=https://loaclhost:32524/
ENV OTF_EMAIL=email@email.com
ENV AUTHENTICATION_SECRET=/ytoYB+iD5HUuDLmeqStcoUPwqw=
ENV SERVICEAPI_URL=https://localhost:32303/otf/api/
ENV SERVICEAPI_URIEXECUTETESTINSTANCE=testInstance/execute/v1/id/
ENV SERVICEAPI_AAFID=username
ENV SERVICEAPI_AAFPASSWORD=password
ENV CAMUNDAAPI_URL=https://localhost:31313/
ENV CAMUNDAAPI_AAFID=username
ENV CAMUNDAAPI_AAFPASSWORD=password
ENV MONGO_BASEURL=localhost:27017/
ENV MONGO_DBOTF=otf
ENV MONGO_REPLICASET=mongoOTF
ENV MONGO_USERNAME=username
ENV MONGO_PASSWORD=password

COPY . /home/node
WORKDIR /home/node

RUN mkdir -p /otf/logs

RUN npm install --unsafe-perm
RUN npm run-script build

ENTRYPOINT [ "npm", "start" ]

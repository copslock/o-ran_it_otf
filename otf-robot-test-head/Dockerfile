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

FROM python:2.7

# ARG HTTP_PROXY="http://localhost:8080" 
# ARG HTTPS_PROXY="http://localhost:8080" 
# ARG http_proxy="http://localhost:8080" 
# ARG https_proxy="http://localhost:8080"

ENV NAMESPACE=namespace
ENV APP_NAME=otf-robot-test-head
ENV APP_VERSION=1.0
ENV OTF_MONGO_HOSTS=localhost:27017/
ENV OTF_MONGO_DATABASE=otf
ENV OTF_MONGO_REPLICASET=rs0
ENV OTF_MONGO_USERNAME=username
ENV OTF_MONGO_PASSWORD=password
ENV APP_SETTINGS=app.configuration.DevelopmentConfiguration

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD run.py run.py
ADD app app

RUN python -m pip install -r pip-requirements.txt

RUN mkdir -p /otf/logs

ENTRYPOINT ["python", "run.py"]
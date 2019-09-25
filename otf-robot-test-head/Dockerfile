FROM python:2.7

# ARG HTTP_PROXY="http://localhost:8080" 
# ARG HTTPS_PROXY="http://localhost:8080" 
# ARG http_proxy="http://localhost:8080" 
# ARG https_proxy="http://localhost:8080"

ENV NAMESPACE=namespace
ENV APP_NAME=otf-robot-test-head
ENV APP_VERSION=1.0
ENV OTF_MONGO_HOSTS=localhost:27017
ENV OTF_MONGO_DATABASE=otf
ENV OTF_MONGO_REPLICASET=mongoOTF
ENV OTF_MONGO_USERNAME=username
ENV OTF_MONGO_PASSWORD=password

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD run.py run.py
ADD app app

RUN python -m pip install -r pip-requirements.txt

RUN mkdir -p /otf/logs

ENTRYPOINT ["python", "run.py"]
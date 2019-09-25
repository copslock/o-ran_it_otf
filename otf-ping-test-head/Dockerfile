FROM python:2.7

# ARG HTTP_PROXY="localhost:8080"
# ARG HTTPS_PROXY="localhost:8080"
# ARG http_proxy="localhost:8080"
# ARG https_proxy="localhost:8080"


ENV NAMESPACE=namespace
ENV APP_NAME=otf-ping-test-head
ENV APP_VERSION=1.0

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD otfPingTestHead.py otfPingTestHead.py

RUN mkdir -p /otf/logs

RUN python -m pip install -r pip-requirements.txt

ENTRYPOINT ["python", "otfPingTestHead.py"]

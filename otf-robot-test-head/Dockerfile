FROM python:2.7

ARG HTTP_PROXY="http://localhost:8080" 
ARG HTTPS_PROXY="http://localhost:8080" 
ARG http_proxy="http://localhost:8080" 
ARG https_proxy="http://localhost:8080"

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD run.py run.py
ADD app app

RUN python -m pip install -r pip-requirements.txt

RUN mkdir -p /otf/logs

ENTRYPOINT ["python", "run.py"]
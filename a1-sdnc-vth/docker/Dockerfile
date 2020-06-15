FROM python:3.7.4

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD app app
ADD config.ini config.ini
ADD run.py run.py

RUN mkdir -p /otf/logs

RUN python -m pip install --proxy http://one.proxy.att.com:8080 -r pip-requirements.txt

ENV USER=default_user
ENV PW=default_pass


ENTRYPOINT ["python", "run.py"]

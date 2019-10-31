FROM python:2.7

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD ric-test-head.py ric-test-head.py
ADD config.json config.json

RUN mkdir -p /otf/logs

RUN python -m pip install -r pip-requirements.txt

ENTRYPOINT ["python", "ric-test-head.py"]

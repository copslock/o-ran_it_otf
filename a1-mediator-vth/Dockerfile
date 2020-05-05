FROM python:3.7.4

RUN python --version

ADD pip-requirements.txt pip-requirements.txt
ADD a1-mediator-vth.py a1-mediator-vth.py
ADD config.json config.json

RUN mkdir -p /otf/logs

RUN python -m pip install --proxy -r pip-requirements.txt

ENTRYPOINT ["python", "a1-mediator-vth.py"]

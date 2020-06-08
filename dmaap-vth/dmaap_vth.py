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
# File name: dmaap-vth.py                                                      #
# Description: vth that utilize dmaap  to subscribe and publish to topics      #
# Date created: 02/21/2020                                                     #
# Last modified: 04/02/2020                                                    #
# Python Version: 3.7                                                          #
# Author: Jackie Chen (jv246a)                                                 #
# Email: jv246a@att.com                                                        #
################################################################################

import datetime
from configparser import ConfigParser
import os
import logging
from logging import FileHandler
import requests
from flask import Flask, request, jsonify

# redirect http to https
app = Flask(__name__)

# Prevents print statement every time an endpoint is triggered.
logging.getLogger("werkzeug").setLevel(logging.WARNING)


def sendCallback(url, data):
    try:
        if type(data) is not dict:
            data = {"msg": data}
        app.logger.info("sending callback")
        requests.post(url, json= data)
    except Exception as e:
        app.logger.info(e)
    return

def unix_time_millis(dt):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch).total_seconds() * 1000.0


def _get_request_data():
    if not request.is_json:
        raise ValueError("request must be json")
    requestData = request.get_json()
    return requestData


def _get_config(config_file_name):
    config = ConfigParser(os.environ)
    config.read(config_file_name)
    return config

def _validate_request(request_data, isPublish=True):
    missing_params = []

    if 'topic_name' not in request_data:
        missing_params.append("topic_name")
    if isPublish:
        if 'data' not in request_data:
            missing_params.append('data')
    else:
        if 'consumer_group' not in request_data:
            missing_params.append('consumer_group')
        if 'consumer_id' not in request_data:
            missing_params.append('consumer_id')

    if missing_params:
        err_msg = '{} request requires the following: '.format('publish' if isPublish else 'subscribe')
        err_msg += ','.join(missing_params)
        raise KeyError(err_msg)


def _build_url(config, request_data, is_publish=True):
    if is_publish:
        base_path = config['resource']['base_address'] + config['resource']['publish']
        topic_name = request_data['topic_name']
        publish_address = base_path.format(topic_name=topic_name)
        return publish_address

    base_path = config['resource']['base_address'] + config['resource']['subscribe']
    topic_name = request_data['topic_name']
    consumer_group = request_data['consumer_group']
    consumer_id = request_data['consumer_id']
    subscribe_address = base_path.format(topic_name=topic_name, consumer_group=consumer_group, consumer_id=consumer_id)
    if ('timeout' in request_data):
        subscribe_address = (subscribe_address + '?timeout={}').format(request_data['timeout'])
    return subscribe_address


def _send_request(url, config, is_subscribe_request=False, payload=None):
    # setup default values
    auth_enabled = config.getboolean('auth', 'auth_enabled')
    proxy_enabled = config.getboolean('resource', 'proxy_enabled')
    username = ''
    password = ''
    req_proxies = {
        'http': None,
        'https': None
    }
    # place proxy and authentication information
    if auth_enabled:
        username = config['auth']['username']
        password = config['auth']['password']
    if proxy_enabled:
        req_proxies['http'] = config['resource']['http_proxy']
        req_proxies['https'] = config['resource']['https_proxy']

    # for subscribe request
    if is_subscribe_request:
        return requests.get(url,
                            auth=(username, password) if auth_enabled else None,
                            proxies=req_proxies)
    # for publish request
    req_headers = {'Content-type': 'application/json'}
    return requests.post(url,
                         json=payload,
                         auth=(username, password) if auth_enabled else None,
                         proxies=req_proxies,
                         headers=req_headers)

@app.route("/otf/vth/oran/dmaap/v1/health", methods=['GET'])
def getHealth():
    return 'UP'

@app.route("/otf/vth/oran/dmaap/v1/subscribe", methods=["POST"])
def subscribeRequest():
    response_data = {
        'vthResponse': {
            'testDuration': '',
            'dateTimeUTC': str(datetime.datetime.now()),
            'abstractMessage': '',
            'resultData': {}
        }
    }
    ret_url = request.args.get('retURL')
    startTime = unix_time_millis(datetime.datetime.now())
    try:
        # validate request
        request_data = _get_request_data()
        _validate_request(request_data, isPublish=False)
        app.logger.info("incoming subscribe request w/ the following payload:" + str(request_data))

        # setup phase
        config = _get_config('config.ini')
        subscribe_address = _build_url(config, request_data, is_publish=False)

        # build response
        app.logger.info('Sending GET to subscribe')
        res = _send_request(subscribe_address, config, is_subscribe_request=True)
        app.logger.info('Response received from subscribe: {}'.format(res.json()))
        response_data['vthResponse']['abstractMessage'] = 'Result from subscribe request'
        response_data['vthResponse']['resultData']['status_code'] = res.status_code
        response_data['vthResponse']['resultData']['result_output'] = res.json()
    except Exception as ex:
        endTime = unix_time_millis(datetime.datetime.now())
        totalTime = endTime - startTime
        response_data['vthResponse']['testDuration'] = totalTime
        response_data['vthResponse']['abstractMessage'] = 'error: ' + str(ex)
        app.logger.error('ERROR:{}'.format(str(ex)))
        return jsonify(response_data)

    endTime = unix_time_millis(datetime.datetime.now())
    totalTime = endTime - startTime
    response_data['vthResponse']['testDuration'] = totalTime
    if ret_url is not None:
        sendCallback(ret_url,response_data)
        return '',200
    return jsonify(response_data), 200


@app.route("/otf/vth/oran/dmaap/v1/publish", methods=['POST'])
def publishRequest():
    response_data = {
        'vthResponse': {
            'testDuration': '',
            'dateTimeUTC': str(datetime.datetime.now()),
            'abstractMessage': '',
            'resultData': {}
        }
    }
    startTime = unix_time_millis(datetime.datetime.now())
    ret_url = request.args.get('retURL')

    try:
        # validate request
        request_data = _get_request_data()
        _validate_request(request_data)
        app.logger.info("incoming publish request w/ the following payload:" + str(request_data))

        # setup phase
        config = _get_config('config.ini')
        payload = request_data['data']
        publish_address = _build_url(config, request_data)

        # build response
        app.logger.info("Sending POST to publish")
        res = _send_request(url=publish_address, config=config, payload=payload)
        app.logger.info("Response received from publish: {}".format(res.json()))
        response_data['vthResponse']['abstractMessage'] = 'Result from publish request'
        response_data['vthResponse']['resultData']['status_code'] = res.status_code
        response_data['vthResponse']['resultData']['result_output'] = res.json()
    except Exception as ex:
        endTime = unix_time_millis(datetime.datetime.now())
        totalTime = endTime - startTime
        response_data['vthResponse']['testDuration'] = totalTime
        response_data['vthResponse']['abstractMessage'] = 'error: ' + str(ex)
        app.logger.error('ERROR:{}'.format(str(ex)))
        return jsonify(response_data)

    endTime = unix_time_millis(datetime.datetime.now())
    totalTime = endTime - startTime
    response_data['vthResponse']['testDuration'] = totalTime
    if ret_url is not None:
        sendCallback(ret_url,response_data)
        return '',200
    return jsonify(response_data), 200

if __name__ == '__main__':
    logHandler = FileHandler('dmaap-vth.log', mode='a')
    logHandler.setLevel(logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(logHandler)
    # context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
    # app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
    app.run(debug=False, host='0.0.0.0', port=5000)

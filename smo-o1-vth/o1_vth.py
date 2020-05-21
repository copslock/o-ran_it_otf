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
# File name: smo-o1-vth.py                                                        #
# Description: Mainly used to get alarm list                                   #
# Date created: 04/14/2020                                                     #
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


def _get_config(config_file_name):
    config = ConfigParser(os.environ)
    config.read(config_file_name)
    return config


def _build_url(config):
    return config['resource']['base_address'] + config['resource']['get_config_alarms_list']


def _send_request(url, config):
    # setup default values
    proxy_enabled = config.getboolean('resource', 'proxy_enabled')
    auth_enabled = config.getboolean('auth', 'auth_enabled')
    username = ''
    password = ''

    req_proxies = {
        'http': None,
        'https': None
    }
    # place proxy information
    if proxy_enabled:
        req_proxies['http'] = config['resource']['http_proxy']
        req_proxies['https'] = config['resource']['https_proxy']
    if auth_enabled:
        username = config['auth']['username']
        password = config['auth']['password']
    # get call for alarm list
    return requests.get(url,
                        auth=(username, password) if auth_enabled else None,
                        proxies=req_proxies if proxy_enabled else None)

def _parse_resposne(response):
    try:
        return response.json()
    except ValueError:
        return response.text

@app.route('/otf/vth/oran/smo/v1/alarm-list' , methods=['POST'])
def get_alarm_list():
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
        # setup phase
        config = _get_config('config.ini')
        alarm_list_url = _build_url(config)

        # build initial response
        app.logger.info('Sending GET for alarm list')
        res = _send_request(alarm_list_url, config)
        app.logger.info('Status code from GET: {}'.format(res.status_code))
        app.logger.info('Response received from GET alarm-list: {}'.format(res.content))
        response_data['vthResponse']['abstractMessage'] = 'Result from GET alarm list request'
        response_data['vthResponse']['resultData']['status_code'] = res.status_code
        response_data['vthResponse']['resultData']['result_output'] = _parse_resposne(res)
    except Exception as ex:
        endTime = unix_time_millis(datetime.datetime.now())
        totalTime = endTime - startTime
        response_data['vthResponse']['testDuration'] = totalTime
        response_data['vthResponse']['abstractMessage'] = 'error: ' + str(ex)
        app.logger.error('ERROR:{}'.format(str(ex)))
        return jsonify(response_data)

    #finish up building response
    endTime = unix_time_millis(datetime.datetime.now())
    totalTime = endTime - startTime
    response_data['vthResponse']['testDuration'] = totalTime
    if ret_url is not None:
        sendCallback(ret_url, response_data)
        return '', 200
    return jsonify(response_data), 200

@app.route("/otf/vth/oran/smo/v1/health", methods=['GET'])
def getHealth():
    return 'UP'

if __name__ == '__main__':
    logHandler = FileHandler('smo-o1-vth.log', mode='a')
    logHandler.setLevel(logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(logHandler)
    # context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
    # app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
    app.run(debug=False, host='0.0.0.0', port=5000)

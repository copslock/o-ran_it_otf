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
# File name: a1-mediator-vth.py                                                         #
# Description: vth for a1-mediator-vth service                                              #
# Date created: 08/22/2019                                                     #
# Last modified: 04/02/2020                                                    #
# Python Version: 3.7.4                                                        #
# Author: Jackie Chen (jv246a)                                                 #
# Email: jv246a@att.com                                                        #
################################################################################
import datetime
import json
import logging
from logging import FileHandler
import os

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
        requests.post(url, json=data)
    except Exception as e:
        app.logger.info(e)
    return

def unix_time_millis(dt):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch).total_seconds() * 1000.0


@app.route("/otf/vth/oran/a1/v1/health", methods=['GET'])
def getHealth():
    return "UP"


@app.route("/otf/vth/oran/a1/v1", methods=['POST'])
def executeRicRequest():
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
        if not request.is_json:
            raise ValueError("request must be json")

        requestData = request.get_json()

        app.logger.info("A1 requestData:" + str(requestData))

        action = requestData['action'].lower()
        _check_incoming_request(requestData)

        os.environ['NO_PROXY'] = '127.0.0.1'  # TODO testing purpose w/ mock server. Needs to remove on final version
        with open('config.json') as configFile:
            config = json.load(configFile)

        baseAddress = config['base_address']
        if action == 'health_check' or action == 'list_policy':
            res = requests.get(baseAddress + config['actions_path'][action])
            response_data['vthResponse']['resultData']['statusCode'] = res.status_code
            if action == 'health_check':
                response_data['vthResponse']['resultData']['resultOutput'] = res.text
            else:
                response_data['vthResponse']['resultData']['resultOutput'] = res.json()
        elif action == 'list_policy_instance':
            res = requests.get(baseAddress + config['actions_path'][action]
                               .format(policy_type_id=requestData['policy_type_id']))
            response_data['vthResponse']['resultData']['statusCode'] = res.status_code
            response_data['vthResponse']['resultData']['resultOutput'] = res.json()
        elif action == 'get_policy_instance_status':
            res = requests.get(baseAddress + config['actions_path'][action]
                               .format(policy_type_id=requestData['policy_type_id'],
                                       policy_instance_id=requestData['policy_instance_id']))
            response_data['vthResponse']['resultData']['statusCode'] = res.status_code
            response_data['vthResponse']['resultData']['resultOutput'] = res.json()
        elif action == 'edit_policy':
            res = _send_edit_request(requestData, config)
            response_data['vthResponse']['resultData']['statusCode'] = res.status_code
            if requestData['request_type'].lower() == 'get' and res.status_code == 200:
                response_data['vthResponse']['resultData']['resultOutput'] = res.json()
            else:
                response_data['vthResponse']['resultData']['resultOutput'] = res.text
        elif action == 'edit_policy_instance':
            res = _send_edit_request(requestData, config)
            response_data['vthResponse']['resultData']['statusCode'] = res.status_code
            if requestData['request_type'].lower() == 'get' and res.status_code == 200:
                response_data['vthResponse']['resultData']['resultOutput'] = res.json()
            else:
                response_data['vthResponse']['resultData']['resultOutput'] = res.text

    except Exception as ex:
        endTime = unix_time_millis(datetime.datetime.now())
        totalTime = endTime - startTime
        response_data['vthResponse']['testDuration'] = totalTime
        response_data['vthResponse']['abstractMessage'] = str(ex)
        return jsonify(response_data)

    endTime = unix_time_millis(datetime.datetime.now())
    totalTime = endTime - startTime

    response_data['vthResponse']['testDuration'] = totalTime

    if ret_url is not None:
        sendCallback(ret_url, response_data)
        return '', 200

    return jsonify(response_data), 200


def _send_edit_request(request_data, config):
    baseAddress = config['base_address']
    path = ''
    action = request_data['action']
    policy_type_id = request_data['policy_type_id']
    request_type = request_data['request_type']
    if action == "edit_policy":
        path = baseAddress + config['actions_path'][action].format(policy_type_id=policy_type_id)
    if action == 'edit_policy_instance':
        instance_id = request_data['policy_instance_id']
        path = baseAddress + config['actions_path'][action].format(policy_type_id=policy_type_id,
                                                                   policy_instance_id=instance_id)
    if request_type == 'get':
        return requests.get(path)
    if request_type == 'put':
        payload = request_data['payload']
        return requests.put(path, payload)
    if request_type == 'delete':
        return requests.delete(path)


def _check_incoming_request(requestData):  # check if the request is valid
    if 'action' not in requestData:
        raise KeyError('no action was specify')

    action = requestData['action'].lower()
    edit_actions = ['edit_policy', 'edit_policy_instance']
    requires_policy_id = ['edit_policy', 'list_policy_instance'
        , 'edit_policy_instance', 'get_policy_instance_status']
    requires_policy_instance_id = ['edit_policy_instance', 'get_policy_instance_status']
    possible_actions = ['health_check', 'list_policy', 'edit_policy', 'list_policy_instance'
        , 'edit_policy_instance', 'get_policy_instance_status']
    possible_request_type = ['get', 'put', 'delete']

    if action not in possible_actions:
        raise KeyError("invalid action")
    if action in edit_actions:  # request type is required
        if 'request_type' not in requestData:
            raise KeyError('this action: ' + action + ' requires a request type')
        if requestData['request_type'] not in possible_request_type:
            raise KeyError('this request_type: ' + requestData['request_type'] + ' is not valid')
        if requestData['request_type'] == 'put' and 'payload' not in requestData:
            raise KeyError('put request requires a payload')
    if action in requires_policy_id:
        if 'policy_type_id' not in requestData:
            raise KeyError('this action: ' + action + ' requires a policy_type_id')
    if action in requires_policy_instance_id:
        if 'policy_instance_id' not in requestData:
            raise KeyError('this action: ' + action + ' requires a policy_instance_id')


if __name__ == '__main__':
    logHandler = FileHandler('a1-mediator-vth.log', mode='a')
    logHandler.setLevel(logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(logHandler)
    # context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
    # app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
    app.run(debug=False, host='0.0.0.0', port=5000)

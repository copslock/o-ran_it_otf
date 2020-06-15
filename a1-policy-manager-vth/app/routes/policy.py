
import datetime
import json
import logging
from logging import FileHandler
import os

import requests
from flask import Flask, request, jsonify
from . import config, ROUTES
from app.helpers import policy_helper as Policy
from app.helpers import response_helper as ResponseHelper
from app.errors.bad_request_exception import BadRequestException



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


def route_check2(get_function=None, post_function=None, put_function=None, delete_function=None):
    """
     Info:
        Since all routes do the same pre-check and have a similar skeleton, this function just refactored the pre-check for code reuse
     Arguments (**kwargs): pass in the specified key(s) and  method(s) that handle the type of method, method must be allowed by route decorator
        get_function => type: function
        put_function => type: function
        delete_function => type: function
    Returns:
        returns the return of the function call, typically a jsonified response.
        you can capture response in a var and execute logic or you can just return the function call/response 
    E.G.:
        response = route_check(post_function = handle_post)
        return route_check(get_function = handle_get, post_function = handle_post)
    """
    response_dict = ResponseHelper.vth_response_dic()
    start_time = unix_time_millis(datetime.datetime.now())
    status_code = 200
    if request.is_json and ResponseHelper.valid_json(request.data):
        if(request.method == 'GET'):
            response_dict = get_function(request, response_dict, config)
        elif(request.method == 'POST'):
            response_dict = post_function(request, response_dict, config)
        elif(request.method == 'PUT'):
            response_dict = put_function(request, response_dict, config)
        elif(request.method == 'DELETE'):
            response_dict = delete_function(request, response_dict, config)
    else:
        raise BadRequestException(406, "Invalid Json")
    end_time = unix_time_millis(datetime.datetime.now())
    response_dict['vthResponse']['testDurationMS'] = end_time-start_time
    return jsonify(response_dict), status_code


@ROUTES.route("/policies", methods=['GET'])
def policies():
    pass

@ROUTES.route("/policy", methods=['GET', 'PUT', 'DELETE'])
def handle_policy():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_using_get, put_function = Policy.put_policy_using_put, delete_function=Policy.delete_policy_using_delete)
    

@ROUTES.route("/policy_ids", methods=['GET'])
def handle_policy_ids():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_ids_using_get)

@ROUTES.route("/policy_schemas", methods=['GET'])
def handle_policy_schemas():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_schemas_using_get)

@ROUTES.route("/policy_schema", methods=['GET'])
def handle_policy_schema():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_schema_using_get)

@ROUTES.route("/policy_status", methods=['GET'])
def handle_policy_status():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_status_using_get)

@ROUTES.route("/policy_types", methods=['GET'])
def handle_policy_types():
    return ResponseHelper.route_check(config=config, get_function = Policy.get_policy_types_using_get)


@ROUTES.route("/", methods=['POST'])
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

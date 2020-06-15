import ast
import requests
from configparser import ConfigParser
import os
import datetime
import json
from flask import request, jsonify, current_app
from app.helpers.time_helper import unix_time_millis
from app.errors.bad_request_exception import BadRequestException

"""
    Module Info:
"""
def create_headers(enable_cache=True, content_type="application/json", connection="Keep-Alive"):
    headers = {'Cache-Control':'no-cache, no-store, must-revalidate', "Pragma":"no-cache", "Expires":"0"} if not enable_cache else {}
    headers['content-type'] = content_type
    headers['connection'] = connection
    return headers
def create_url(config=None, uri_path = "/", url_string=None):
    return config['api']['base_url'] +":"+ config['api']['port']+uri_path if url_string is None else url_string

def valid_string_json(string, response_message="Invalid json string in query or jsonBody, format requires quoted json object e.g. \"{'key':'value, key2:{'innerKey':'innerValue'}}\""):
    try:
        string_to_dict = ast.literal_eval(string)
    except(Exception):
        raise BadRequestException(406, response_message)
    return True
def route_check(config=None, get_function=None, post_function=None, put_function=None, delete_function=None):
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
    if not request.is_json: raise BadRequestException(406, "Invalid Json Request")

    response_dict = vth_response_dic()
    start_time = unix_time_millis(datetime.datetime.now())
    status_code = 200
    ret_url = request.args.get('retURL')

    query = ""
    json_body = ""
    request_data = request.json
    json_keys = set(request_data)
    action_request = request_data.get("action").lower()
    valid_actions = {"geta1policytype", "geta1policy", "puta1policy", "deletea1policy", "geta1policystatus"}
    required_keys = {"action", "auth", "action_data"}

    #check for valid action and json request contains required keys
    if not required_keys <= json_keys: raise BadRequestException(406, "Json request is missing required keys {}".format(required_keys))
    if not action_request in valid_actions: raise BadRequestException(406, "Action is not supported {}".format(action_request))
    #check request's action_data key contains required keys
    if 'query' not in request.json['action_data']: raise BadRequestException(406, "action_data must contain query and jsonBody ")
    if 'jsonBody' not in request.json['action_data']: raise BadRequestException(406, "action_data must contain query and jsonBody")

    query = request.json['action_data']['query'] if 'query' in request.json['action_data'] else ""
    json_body = request.json['action_data']['jsonBody'] if 'jsonBody' in request.json['action_data'] else ""

    if valid_string_json(query) and valid_string_json(json_body):
        if(request.method == 'GET'):
            response_dict = get_function(request, response_dict, config)
        elif(request.method == 'POST'):
            response_dict = post_function(request, response_dict, config)
        elif(request.method == 'PUT'):
            response_dict = put_function(request, response_dict, config)
        elif(request.method == 'DELETE'):
            response_dict = delete_function(request, response_dict, config)
    else:
        raise BadRequestException(406, "Invalid JSON Strings")
    end_time = unix_time_millis(datetime.datetime.now())
    response_dict['vthResponse']['testDurationMS'] = end_time-start_time
    if ret_url is not None:
        sendCallback(ret_url,response_dict)
        return '',200
    return jsonify(response_dict), status_code

def get_proxies(config):
    proxy_enabled = config.getboolean('resource', 'proxy_enabled')
    req_proxies = {
        'http': None,
        'https': None
    }
    if not proxy_enabled:
        return None
    else:
        req_proxies['http'] = config['resource']['http_proxy']         
        req_proxies['https'] = config['resource']['https_proxy']
        return req_proxies
def get_credentials(json_data, config):
    auth_enabled = config.getboolean('auth', 'creds_enabled')
    if not auth_enabled:
        return None
    else:
        username = config['auth']['username'] if 'username' not in json_data['auth'] else json_data['auth']['username']
        password = config['auth']['password'] if 'password' not in json_data['auth'] else json_data['auth']['password']
        return (username, password)
def vth_response_dic():
    """
    Args:
    Returns:
    Examples:
    """
    response_data = {
        "vthResponse": {
            "testDurationMS": "",
            'dateTimeUTC': str(datetime.datetime.now()),
            "abstractMessage": "Success",
            "resultData": {}
        }
    }
    return response_data
#TODO data is data from callback and not my json response
def sendCallback(url, data):
    try:
        if type(data) is not dict:
            data = {"msg": data}
        current_app.logger.info("sending callback")
        requests.post(url, json=data)
    except Exception as e:
        current_app.logger.info(e)
    return

def get_request_data(request):
    if not request.is_json:
        raise ValueError("request must be json")
    requestData = request.get_json()
    return requestData


def valid_json(data):

    try:
        _ = json.loads(data)
    except ValueError as e:
        return False
    return True
def get_config(config_file_name):
    config = ConfigParser(os.environ)
    config.read(config_file_name)
    return config

def validate_request(request_data, isPublish=True):
    return
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


def build_url(config, request_data, is_publish=True):
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


def send_request(url, config, is_subscribe_request=False, payload=None):
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
                            proxies=req_proxies if proxy_enabled else None)
    # for publish request
    req_headers = {'Content-type': 'application/json'}
    return requests.post(url,
                         json=payload,
                         auth=(username, password) if auth_enabled else None,
                         proxies=req_proxies if proxy_enabled else None,
                         headers=req_headers)

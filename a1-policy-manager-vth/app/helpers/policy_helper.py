from app.helpers import response_helper as ResponseHelper
from flask import current_app
from app.errors.bad_request_exception import BadRequestException
import requests

def get_policy_using_get(request, response_dict, config):
    json_data = request.get_json()
    if 'id' not in json_data: raise BadRequestException(406, "Request is missing id")
    param = {'id': json_data['id']}
    creds = ResponseHelper.get_credentials(json_data, config)
    url = ResponseHelper.create_url(config=config, uri_path="/policy")
    res = requests.get(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response

    return response_dict
def put_policy_using_put(request, response_dict, config):
    json_data = request.get_json()
    creds = ResponseHelper.get_credentials(json_data, config)

    current_app.logger.info("creds: {}".format(creds))

    required = {'id', 'jsonBody', 'ric', 'service'}
    param_keys = {'id', 'ric', 'service'}
    optional = {"type"}
    data_keys = param_keys.copy()
    keys = set(json_data.keys())
    if not required <= keys:
        raise BadRequestException(406, "Request is missing required values {}".format(required))
    if optional <= keys: data_keys.update(optional)
    param = {}
    body = {}
    for key in data_keys:
        param[key] = json_data[key]
    body['jsonBody'] = json_data['jsonBody']

    url = ResponseHelper.create_url(config=config, uri_path="/policy")
    res = requests.put(url, auth=creds, params=param, json=body)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict
def delete_policy_using_delete(request, response_dict, config):
    json_data = request.get_json()
    creds = ResponseHelper.get_credentials(json_data, config)

    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'id'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))
    param = {'id': json_data['id']}

    url = ResponseHelper.create_url(config=config, uri_path="/policy")
    res = requests.delete(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict

def get_policy_ids_using_get(request, response_dict, config):
    json_data = request.get_json()
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    param = {
            "ric":json_data["ric"] if "ric" in json_data else "",
            "service":json_data["service"] if "service" in json_data else "",
            "type":json_data["type"] if "type" in json_data else ""
            }

    url = ResponseHelper.create_url(config=config, uri_path="/policy_ids")
    res = requests.get(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict

def get_policy_schema_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'id'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))
    param = {'id': json_data['id']}

    url = ResponseHelper.create_url(config=config, uri_path="/policy_schema")
    res = requests.get(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict
def get_policy_schemas_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    param = {
            "ric":json_data['ric'] if 'ric' in json_data else ""
            }
    #api_response = requests.put(url, credentials=creds, params=param)

    url = ResponseHelper.create_url(config=config, uri_path="/policy_schemas")
    res = requests.get(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict
def get_policy_status_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'id'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))
    param = {
            "id":json_data["id"]
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict
def get_policy_types_using_get(request, response_dict, config):
    json_data = request.get_json()
    creds = ResponseHelper.get_credentials(json_data, config)
    param = {
            'ric': json_data['ric'] if 'ric' in json_data else ""
            }

    url = ResponseHelper.create_url(config=config, uri_path="/a1-p/policytypes")
    res = requests.get(url, auth=creds, params=param)
    response = {
            "status_code":res.status_code,
            "result": res.json()
            }
    response_dict['vthResponse']['resultData'] = response
    return response_dict


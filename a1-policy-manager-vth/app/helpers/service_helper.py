
from app.helpers import response_helper as ResponseHelper
from flask import current_app
from app.errors.bad_request_exception import BadRequestException

def get_services_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    param = {
            'name': json_data['name'] if 'name' in json_data else ""
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict
def delete_services_using_delete(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'name'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))

    param = {
            'name': json_data['name']
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict
def put_service_using_put(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'registrationInfo'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))

    param = {
            'registrationInfo': json_data['registrationInfo']
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict

def keep_alive_service_using_put(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'name'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))

    param = {
            'name': json_data['name']
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict

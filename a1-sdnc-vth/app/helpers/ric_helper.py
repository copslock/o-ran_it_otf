from app.helpers import response_helper as ResponseHelper
from flask import current_app
from app.errors.bad_request_exception import BadRequestException

def get_ric_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))

    keys = set(json_data.keys())
    required = {'managedElementId'}
    if not required <= keys: raise BadRequestException(406, "Request is missing required values {}".format(required))

    param = {
            'managedElementId': json_data['managedElementId']
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict
def get_rics_using_get(request, response_dict, config):
    json_data = request.get_json()
    #username = config['auth']['username'] if 'username' not in json_data else json_data['username']
    #password = config['auth']['password'] if 'password' not in json_data else json_data['password']
    #creds = (username, password)
    creds = ResponseHelper.get_credentials(json_data, config)
    current_app.logger.info("creds: {}".format(creds))
    param = {
            "policyType": json_data["policyType"] if "policyType" in json_data else ""
            }

    response_dict['vthResponse']['resultData'] = param
    #api_response = requests.get(url, credentials=creds, params=param)
    return response_dict

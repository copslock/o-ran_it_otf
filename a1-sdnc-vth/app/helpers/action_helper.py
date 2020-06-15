import json
import ast
from app.helpers import response_helper as ResponseHelper
from flask import current_app, jsonify
from app.errors.bad_request_exception import BadRequestException
import requests


def execute_action(request, response_dict, config):
    headers = ResponseHelper.create_headers();
    request_data = request.json
    action_request = request_data.get("action").lower()
    
    creds = ResponseHelper.get_credentials(request_data, config)
    proxies = ResponseHelper.get_proxies(config)
    url = ResponseHelper.create_url(config=config, uri_path="/restconf/operations/A1-ADAPTER-API:"+action_request)
#    ret_url = request.args.get('retURL')

    json_req = ast.literal_eval(request_data["action_data"]["jsonBody"])
    current_app.logger.info("Requesting Url: {}, body: {}, auth: {}, proxies: {}".format(url, json_req, creds, proxies))
    try:
        res = requests.post(url, proxies=proxies, auth=creds, headers=headers, json=json_req)
        response = {
                "status_code":res.status_code,
                "result": res.json()
                }
    except(json.decoder.JSONDecodeError):
        response = {
                "status_code":res.status_code,
                "result": res.reason
                }
    except requests.exceptions.RequestException:
        response = {
                "status_code":504,
                "result": "Something Happned"
                }
    finally:
        response_dict['vthResponse']['resultData'] = response
#        if ret_url is not None:
#            ResponseHelper.sendCallback(ret_url,response_dict)
#            return '',200
        return response_dict

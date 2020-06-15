import json
import ast
from app.helpers import response_helper as ResponseHelper
from flask import current_app
from app.errors.bad_request_exception import BadRequestException
import requests

def execute_action(request, response_dict, config):
    headers = ResponseHelper.create_headers();
    request_data = request.json
    action_request = request_data.get("action").lower()
    method = request_data.get("method").upper()
    creds = ResponseHelper.get_credentials(request_data, config)

    proxies = ResponseHelper.get_proxies(config)
    action = "services/keepalive" if action_request == "keepalive" else action_request
    url = ResponseHelper.create_url(config=config, uri_path="/"+action)
#    ret_url = request.args.get('retURL')


    json_req = ast.literal_eval(request_data["action_data"]["jsonBody"])
    query_params = ast.literal_eval(request_data["action_data"]["query"])
    current_app.logger.info("Requesting Url: {}, params: {}, body: {}, auth: {}, proxies: {}".format(url, query_params, json_req, creds, proxies))
    try:
        if(method == "GET"):
            res = requests.get(url, proxies=proxies, auth=creds, headers=headers, params=query_params, json=json_req)
        elif(method == "POST"):
            res = requests.post(url, proxies=proxies, auth=creds, headers=headers, params=query_params, json=json_req)
        elif(method == "PUT"):
            res = requests.put(url, proxies=proxies, auth=creds, headers=headers, params=query_params, json=json_req)
        elif(method == "DELETE"):
            res = requests.delete(url, proxies=proxies, auth=creds, headers=headers, params=query_params, json=json_req)
        else: 
            raise BadRequestException(406, "Method Not Supported")
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
 #       if ret_url is not None:
 #           ResponseHelper.sendCallback(ret_url,response_dict)
 #           return '',200
        return response_dict

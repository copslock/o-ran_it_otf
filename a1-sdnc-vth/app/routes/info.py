"""
Args:
Returns:
Examples:
"""
import json
import datetime
from flask import current_app, jsonify, request
import time
import requests
from app.errors.bad_request_exception import BadRequestException
from app.helpers.time_helper import unix_time_millis, timed_function
from app.helpers.response_helper import vth_response_dic
from app.helpers import response_helper as ResponseHelper
from app.helpers import action_helper as Info
from . import config, ROUTES


@ROUTES.route("/handle_action", methods=['POST'])
def handle_action_request():
    return ResponseHelper.route_check(config=config, post_function = Info.execute_action)


@ROUTES.route("/", methods=['GET'])
def get_base():
    """
    Args:
    Returns:
    Examples:
    """
    current_app.logger.info(request.method)
    response = vth_response_dic()
    data = current_app.url_map
    rules = []
    methods_list = []
    for rule in data.iter_rules():
        ma = {rule.rule:[]}
        for val in rule.methods:
            if (val != "OPTIONS") and (val !="HEAD"):
                #print(val)
                ma[rule.rule].append(val)
        rules.append(ma)

    #    methods_set.add(rule.methods)
        #print(rule.methods)
    #print(rules)
    response["vthResponse"]["resultData"] = rules
    #current_app.logger.info(current_app.url_map)
    current_app.logger.debug("hit health point")
    return jsonify(response)

@ROUTES.route("/health", methods=['GET'])
def get_health():
    """
    Args:
    Returns:
    Examples:
    """
    current_app.logger.debug("hit health point")
    return "UP"

@ROUTES.route("/status", methods=['GET'])
def get_status():
    """
    Args:
    Returns:
    Examples:
    """
    suma = lambda: time.sleep(1)
    #current_app.logger.info(current_app.url_map)
    current_app.logger.info(unix_time_millis(datetime.datetime.now()))
    current_app.logger.info(timed_function(suma))
    current_app.logger.debug("some stuff")
    #raise Exception("some error")
    raise BadRequestException()
    return "Running"

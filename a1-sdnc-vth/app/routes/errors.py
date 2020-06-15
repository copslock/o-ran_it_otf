"""
Module Info:
"""
from flask import jsonify, current_app, Blueprint
from app.helpers.error_helper import error_dic
from app.errors.bad_request_exception import BadRequestException
import traceback

ERRORS = Blueprint('errors', __name__)

@ERRORS.app_errorhandler(BadRequestException)
def handle_bad_request(error):
    """
    Args:
    Returns:
    Examples:
    """
    current_app.logger.info(error)
    response = error_dic(error, error.status_code, error.message)
    print(traceback.format_exc())
    return jsonify(response), error.status_code

@ERRORS.app_errorhandler(Exception)
def handle_error(error):
    """
    Args:
    Returns:
    Examples:
    """
    status_code = 500
    response = error_dic(error, status_code)
    print(traceback.format_exc())
    return jsonify(response), status_code

from flask import current_app
import datetime
"""
Args:
Returns:
Examples:
"""

def error_dic(error, status_code, response_message="Something went wrong, vth encountered an error"):
    """
    Args:
    Returns:
    Examples:
    """
    message = [str(x) for x in error.args]
    error_log={
            "error":{
                "type": error.__class__.__name__,
                "message": message
                }
            }
    response_data = {
        "vthResponse": {
            "testDurationMS": 0,
            'dateTimeUTC': str(datetime.datetime.now()),
            "abstractMessage": "Failed",
            "error":response_message,
            "status_code": status_code,
            "resultData": {}
        }
    }
    current_app.logger.error(error_log)
    return response_data

def error_dic2(error, status_code=500):
    """
    Args:
    Returns:
    Examples:
    """
    message = [str(x) for x in error.args]
    response = {
        "status_code" : status_code,
        "success": False,
        "error":{
            "type": error.__class__.__name__,
            "message": message
            }
        }
    return response


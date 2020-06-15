
from app.helpers import response_helper as ResponseHelper
from app.helpers import ric_helper as Ric
from . import config, ROUTES

@ROUTES.route("/ric", methods=['GET'])
def handle_ric():
    return ResponseHelper.route_check(config=config, get_function=Ric.get_ric_using_get)

@ROUTES.route("/rics", methods=['GET'])
def handle_rics():
    return ResponseHelper.route_check(config=config, get_function=Ric.get_rics_using_get)

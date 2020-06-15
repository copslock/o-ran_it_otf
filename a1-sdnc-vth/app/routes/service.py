from app.helpers import response_helper as ResponseHelper
from app.helpers import service_helper as Service
from . import config, ROUTES

@ROUTES.route("/services", methods=['GET', 'DELETE'])
def handleS_services():
    return ResponseHelper.route_check(config=config, get_function=Service.get_services_using_get, delete_function=Service.delete_services_using_delete)


@ROUTES.route("/service", methods=['PUT'])
def handle_service():
    return ResponseHelper.route_check(config=config, put_function=Service.put_service_using_put)

@ROUTES.route("/services/keepalive", methods=['PUT'])
def handle_services_keepalive():
    return ResponseHelper.route_check(config=config, put_function=Service.keep_alive_service_using_put)

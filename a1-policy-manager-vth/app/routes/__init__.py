"""
    Module Info:
    Anything imported to this file will be available to outside modules.
    Routes need to be exported to be usable, if removed, routes will not be found and response
    will be a 500.
    ROUTE order matters, because ROUTE is like a global var used by all the other modules
    it needs to be above them all
"""
from flask import Blueprint
from app.helpers.response_helper import get_config

ROUTES = Blueprint('routes', __name__)
config = get_config("config.ini")

from .policy import *
from .ric import *
from .service import *
from .info import *
from .errors import ERRORS

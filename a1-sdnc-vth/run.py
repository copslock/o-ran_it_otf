"""
#   Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
################################################################################
# File name: a1-sdnc-vth.py                                                         #
# Description: vth for A1 service                                              #
# Date created: 04/22/2020                                                     #
# Last modified: 04/30/2020                                                    #
# Python Version: 3.7.4                                                        #
# Author: Raul Gomez (rg9907)                                                 #
# Email: rg9907@att.com                                                        #
################################################################################
"""
import logging
from logging import FileHandler
from flask import Flask
from flask.logging import create_logger
from app.routes import ROUTES, ERRORS
#from dotenv import load_dotenv

#load dev env vars
#load_dotenv()
# redirect http to https
APP = Flask(__name__)
LOG = create_logger(APP)

# Prevents print statement every time an endpoint is triggered.
logging.getLogger("werkzeug").setLevel(logging.DEBUG)
#logging.getLogger("werkzeug").setLevel(logging.WARNING)
APP.register_blueprint(ERRORS)
APP.register_blueprint(ROUTES, url_prefix="/otf/vth/oran/a1/v1")

if __name__ == '__main__':
    LOG_HANDLER = FileHandler('a1-sdnc-vth.log', mode='a')
    LOG_HANDLER.setLevel(logging.INFO)
    LOG.setLevel(logging.INFO)
    LOG.addHandler(LOG_HANDLER)
   # context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
    # app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
    APP.run(debug=False, host='0.0.0.0', port=6001)

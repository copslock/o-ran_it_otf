""" Copyright (c) 2019 AT&T Intellectual Property.                             #
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
#############################################################################"""


from flask import Flask
from app.routes import *
from app import database


def create_app():
    # create Flask application
    app = Flask(__name__)

    # apply configuration
    app.config.from_object(os.environ['APP_SETTINGS'])
    app.config['g_database'] = None
    app.config['g_base_folder'] = os.path.join(os.getcwd(), 'files')
    app.config['g_data_folder'] = os.path.join(app.config['g_base_folder'], 'data')
    app.config['g_working_folder'] = os.path.join(app.config['g_base_folder'], 'results')

    # register all routes on the APPLICATION_ROOT
    app.register_blueprint(routes, url_prefix=app.config['APPLICATION_ROOT'])

    return app

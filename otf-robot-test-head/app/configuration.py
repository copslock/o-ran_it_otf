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


import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Configuration(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = False
    PREFERRED_URL_SCHEME = 'https'
    APPLICATION_ROOT = '/otf/vth/robot'


class ProductionConfiguration(Configuration):
    DEBUG = False


class DevelopmentConfiguration(Configuration):
    DEVELOPMENT = True
    DEBUG = True


class TestingConfiguration(Configuration):
    DEVELOPMENT = True
    DEBUG = True

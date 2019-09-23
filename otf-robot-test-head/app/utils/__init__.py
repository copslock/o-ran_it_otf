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
import datetime
import json


def unix_time_millis(dt):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch).total_seconds() * 1000.0


def zip_dir(path, zip_handle):
    for root, dirs, files in os.walk(path):
        for f in files:
            zip_handle.write(os.path.join(root, f))


def try_get_json_value(key, data):
    if key not in data:
        raise KeyError('The key {key} is not in {data}.'
                       .format(key=key, data=json.dumps(data)))

    return data[key]


def resolve_robot_status_code(code):
    resolved_message = 'Invalid robot status code.'

    if code == 0:
        resolved_message = 'All critical tests passed.'
    elif 0 <= code <= 249:
        resolved_message = '{numTestsFailed} test(s) failed.'.format(numTestsFailed=code)
    elif code == 250:
        resolved_message = '250 or more critical failures.'
    elif code == 251:
        resolved_message = 'Help or version information printed.'
    elif code == 252:
        resolved_message = 'Invalid test data or command line options.'
    elif code == 253:
        resolved_message = 'Test execution stopped by user.'
    elif code == 255:
        resolved_message = 'Unexpected internal error.'

    return resolved_message




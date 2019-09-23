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


import shutil
import uuid
import zipfile

import gridfs
from bson import ObjectId
from flask import request, make_response, jsonify, current_app
from gridfs import NoFile
from robot import run

from . import routes
from .. import database
from ..utils import *

db_instance = database.DatabaseConfiguration()


def verify_directories():
    # retrieve the app object to retrieve the config we created
    app = current_app._get_current_object()

    if not os.path.isdir(app.config['g_base_folder']):
        os.makedirs(app.config['g_base_folder'])
    if not os.path.isdir(app.config['g_data_folder']):
        os.makedirs(app.config['g_data_folder'])
    if not os.path.isdir(app.config['g_working_folder']):
        os.makedirs(app.config['g_working_folder'])


@routes.route("/v1", methods=['POST'])
def robot():
    app = current_app._get_current_object()

    response_data = {
        "vthResponse": {
            "testDurationMS": "",
            "dateTimeUTC": str(datetime.datetime.now()),
            "abstractMessage": "",
            "resultData": {}
        }
    }

    start_time = unix_time_millis(datetime.datetime.now())

    try:
        if not request.is_json:
            raise ValueError('Invalid JSON object.')

        # get json data from the request
        request_data = request.get_json()

        # get values for expected keys
        vth_input = try_get_json_value('vthInput', request_data)
        test_data = try_get_json_value('testData', vth_input)
        robot_file_id = try_get_json_value('robotFileId', test_data)

        # set up a GridFS to access the database
        db = db_instance.get_database()
        fs = gridfs.GridFS(db)

        # try to find a file using the supplied robot_file_id
        compressed_file = fs.get(ObjectId(robot_file_id))

        # create the directories used during robot processing if they don't exist
        verify_directories()

        # generate a folder named by a uuid to organize data for each request
        random_uuid = uuid.uuid4().get_hex()
        data_dir = os.path.join(app.config['g_data_folder'], random_uuid)
        os.mkdir(data_dir)

        #
        with open(os.path.join(data_dir, compressed_file.name), 'wb') as f:
            f.write(compressed_file.read().__str__())
            f.close()

        with zipfile.ZipFile(os.path.join(data_dir, compressed_file.name)) as zip_ref:
            # Create a temporary folder for storing extracted test file(s)
            test_dir = os.path.join(app.config['g_working_folder'], random_uuid)
            os.mkdir(test_dir)

            # Create a separate folder for the output files, so they can be compressed and sent back to the TCU
            test_output_dir = os.path.join(test_dir, 'output')
            os.mkdir(test_output_dir)

            # Extract the robot tests into the temporary directory
            zip_ref.extractall(test_dir)

            # Run the robot tests with the outputdir pointed to the temporary directory
            return_code = run(os.path.join(test_dir), outputdir=os.path.join(test_dir, 'output'))

            # this path is hardcoded so the entire system path isn't included in the zip
            path = './files/results/{uuid}/output'.format(uuid=random_uuid)
            zip_file = zipfile.ZipFile(path + '.zip', 'w', zipfile.ZIP_DEFLATED, allowZip64=True)
            zip_dir(path, zip_file)
            zip_file.close()

            # save the results to the database
            zf = open(path + '.zip', 'rb')
            result_id = fs.put(zf, filename='output.zip', contentType='application/zip')
            zf.close()

            response_data['vthResponse']['resultData']['robotStatusCode'] = return_code
            response_data['vthResponse']['resultData']['robotResultFileId'] = str(result_id)
            response_data['vthResponse']['abstractMessage'] = resolve_robot_status_code(return_code)



        # delete data from the local disk
        shutil.rmtree(path.replace('/output', ''))
        shutil.rmtree(data_dir)

        # record the end time of the test
        end_time = unix_time_millis(datetime.datetime.now())

        # Calculate the total duration of the test
        total_time = end_time - start_time

        # Set the test duration in the result
        response_data['vthResponse']['testDurationMS'] = total_time

        return jsonify(response_data)
    except NoFile as e:
        # this exception can only occur if robot_file_id is set to something, so don't worry about reference precedence.
        end_time = unix_time_millis(datetime.datetime.now())
        total_time = end_time - start_time

        response_data['vthResponse']['testDurationMS'] = ''
        response_data['vthResponse']['abstractMessage'] = \
            'An exception occurred after running for {totalTime} milliseconds. ' \
            'A file with _id {id} was not found in the collection.'.format(id=robot_file_id, totalTime=total_time)

        response = make_response(json.dumps(response_data))
        return response

    except Exception as e:
        app.logger.error(e)
        end_time = unix_time_millis(datetime.datetime.now())
        total_time = end_time - start_time

        response_data['vthResponse']['testDurationMS'] = ''
        response_data['vthResponse']['abstractMessage'] = \
            'An exception occurred after running for {totalTime} milliseconds. ' \
            'Exception: {exception}.'.format(exception=str(e), totalTime=total_time)

        response = make_response(json.dumps(response_data))

        return response

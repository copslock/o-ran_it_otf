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


from flask import Flask, request, make_response, jsonify, g
import json
import paramiko
import datetime
import logging
import os
from logging import FileHandler

# redirect http to https
app = Flask(__name__)


# Prevents print statement every time an endpoint is triggered.
logging.getLogger("werkzeug").setLevel(logging.WARNING)


def unix_time_millis(dt):
	epoch = datetime.datetime.utcfromtimestamp(0)
	return (dt - epoch).total_seconds() * 1000.0


@app.route("/otf/vth/ssh/v1/health", methods = ['GET'])
def getHealth():
	return "UP"


@app.route('/otf/vth/ssh/v1', methods = ['POST'])
def remoteSSH():
	responseData = {
		"vthResponse": {
			"testDurationMS": "",
			"dateTimeUTC": "",
			"abstractMessage": "",
			"resultData": {}
		}
	}

	responseData['vthResponse']['dateTimeUTC'] = str(datetime.datetime.now())
	start_time = unix_time_millis(datetime.datetime.now())

	try:
		if not request.is_json:
			raise ValueError('Request must be a valid JSON object.')

		request_data = request.get_json()

		if 'vthInput' in request_data:
			vth_input = request_data['vthInput']
			expected_keys = ['vthName', 'testConfig', 'testData']
			received_keys = vth_input.keys();
			test_data = ""
			test_config = ""

			if sorted(expected_keys) == sorted(received_keys):
				test_data = vth_input['testData']

				if 'command' not in test_data:
					raise ValueError('Must supply value testData.command')

			else:
				raise ValueError('Missing one or more expected keys: {expectedKeys}.'.format(expectedKeys=expected_keys))

			test_config = vth_input['testConfig']

			if 'jumpServer' not in test_config:
				raise KeyError('Cannot use jump server when jumpServer key is missing.')

			jump_server = test_config['jumpServer']

			if 'host' not in test_config['jumpServer']:
				raise KeyError('Missing host value in jumpServer.')

			host = test_config['jumpServer']['host']

			if 'credentials' not in jump_server:
				raise KeyError('Missing credentials in jumpServer.')

			credentials = jump_server['credentials']

			if 'username' not in credentials:
				raise KeyError('Missing username in credentials.')

			username = credentials['username']

			if 'password' not in credentials:
				raise KeyError('Missing password in credentials.')

			password = credentials['password']

			ssh = paramiko.SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

			if 'usePrivateKey' in test_config:
				if test_config['usePrivateKey']:
					key_passphrase = os.environ.get('id_otf_key_passphrase')
					app.logger.info(key_passphrase)
					ssh.connect(host, username=username, passphrase='passphrase', key_filename='./ssh/id_otf.key')
					with open('./ssh/id_otf.key', 'r') as myfile:
						data = myfile.read().replace('\n', '')

					app.logger.info(data)
			else:
				ssh.connect(host, username=username, password=password)
			command = test_data['command']
			ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(command)

			responseData['vthResponse']['resultData']['output'] = str(ssh_stdout.read()).replace('"', '\\"').replace('\n', '\\n')
			responseData['vthResponse']['resultData']['error'] = str(ssh_stderr.read()).replace('"', '\\"').replace('\n', '\\n')

		else:
			raise KeyError('Missing vthInput parameter(s)')

		# record the end time of the test
		endTime = unix_time_millis(datetime.datetime.now())

		# Calculate the total duration of the test
		totalTime = endTime - start_time

		# Set the test duration in the result
		responseData['vthResponse']['testDurationMS'] = totalTime

		responseData['vthResponse']['abstractMessage'] = 'done'

		app.logger.info(str(responseData))

		return jsonify(responseData)
	except Exception as e:
		app.logger.info(e)
		responseData['vthResponse']['abstractMessage'] = str(e)
		resp = make_response(json.dumps(responseData))
		endTime = unix_time_millis(datetime.datetime.now())

		totalTime = endTime - start_time
		return resp


if __name__ == '__main__':
	logHandler = FileHandler('otf/logs/sshVTH.log', mode='a')
	# logHandler = FileHandler('sshVTH.log', mode='a')
	logHandler.setLevel(logging.INFO)
	app.logger.setLevel(logging.INFO)
	app.logger.addHandler(logHandler)
	context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
	app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
	# app.run(debug = False, host = '0.0.0.0', port=5000)

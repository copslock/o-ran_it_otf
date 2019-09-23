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
import uuid
import traceback
import pyping
import paramiko
import socket
import os
import subprocess
import datetime
import logging
from logging import FileHandler

#redirect http to https
app = Flask(__name__)


# Prevents print statement every time an endpoint is triggered.
logging.getLogger("werkzeug").setLevel(logging.WARNING)

def unix_time_millis(dt):
	epoch = datetime.datetime.utcfromtimestamp(0)
	return (dt - epoch).total_seconds() * 1000.0

def pingServer(targetHost):
	try:
		response = subprocess.check_output(
			['ping', '-c', '1', targetHost],	# execute the ping command
			stderr = subprocess.STDOUT,  		# retrieve all the output
			universal_newlines = True  			# return as string
		)
	except subprocess.CalledProcessError as e:
		app.logger.error(e)
		app.logger.error('failed getting response from ' + str(targetHost))
		response = None

	return response

@app.route("/otf/vth/ping/v1/health", methods = ['GET'])
def getHealth():
	return "UP"

@app.route('/otf/vth/sample/v1', methods = ['POST'])
def sample():
	startTime = unix_time_millis(datetime.datetime.now())
	responseData = {
		"vthResponse": {
			"testDurationMS": "",
			"dateTimeUTC": "",
			"abstractMessage": "Success",
			"resultData": {}
		}
	}
	responseData['vthResponse']['dateTimeUTC'] = str(datetime.datetime.now())
	endTime = unix_time_millis(datetime.datetime.now())
	responseData['vthResponse']['testDurationMS'] = endTime - startTime
	responseData['vthResponse']['resultData']['result'] = "Executed test successfully in " + str(responseData['vthResponse']['testDurationMS']) + " milliseconds."
	app.logger.info('hit sample endpoint. response: ' + str(responseData))
	return jsonify(responseData)

@app.route('/otf/vth/ping/v1', methods = ['POST'])
def testHead():
	responseData = {
		"vthResponse": {
			"testDurationMS": "",
			"dateTimeUTC": "",
			"abstractMessage": "",
			"resultData": {}
		}
	}

	responseData['vthResponse']['dateTimeUTC'] = str(datetime.datetime.now())
	startTime = unix_time_millis(datetime.datetime.now())

	try:
		if not request.is_json:
			raise ValueError('Request must be a valid JSON object.')

		requestData = request.get_json()
		app.logger.info('ping endpoint. request: ' + str(requestData))

		if 'vthInput' in requestData:
			vthInput = requestData['vthInput']
			expectedKeys = ['vthName', 'testConfig', 'testData']
			receivedKeys = vthInput.keys();
			testData = ""
			testConfig = ""

			if sorted(expectedKeys) == sorted(receivedKeys):
				testData = vthInput['testData']

				# Check if a target host is provided.
				if 'targetHost' not in testData:
					raise KeyError('targetHost is required to ping server.')

				# Check if the target host IP address is in the correct format.
				# This excludes IPv6. Use IPy to check both IPv6/IPv4.
				try:
					socket.inet_aton(testData['targetHost'])
				except socket.error:
					raise ValueError('Invalid IP address assigned to targetHost')

				# Don't use a jump server by default.
				if 'useJumpServer' not in testData:
					testData['useJumpServer'] = False
			else:
				raise ValueError('Missing one or more expected keys: {expectedKeys}.'.format(expectedKeys = expectedKeys))

			if testData['useJumpServer'] == False:
				responseData['vthResponse']['resultData']['result'] = pingServer(testData['targetHost'])
			else:
				testConfig = vthInput['testConfig']

				if 'jumpServer' not in testConfig:
					raise KeyError('Cannot use jump server when jumpServer key is missing.')

				jumpServer = testConfig['jumpServer']

				if 'host' not in testConfig['jumpServer']:
					raise KeyError('Missing host value in jumpServer.')

				host = testConfig['jumpServer']['host']

				if 'credentials' not in jumpServer:
					raise KeyError('Missing credentials in jumpServer.')

				credentials = jumpServer['credentials']

				if 'username' not in credentials:
					raise KeyError('Missing username in credentials.')

				username = credentials['username']

				if 'password' not in credentials:
					raise KeyError('Missing password in credentials.')

				password = credentials['password']

				ssh = paramiko.SSHClient()
				ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
				ssh.connect(host, username = username, password = password)
				command = "ping -c 1 " + testData['targetHost']
				ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(command)
				output = ssh_stdout.read()
				error = ssh_stderr.read()

				responseData['vthResponse']['resultData']['result'] = output
		else:
			raise KeyError('Missing vthInput parameter(s)')

		# record the end time of the test
		endTime = unix_time_millis(datetime.datetime.now())

		# Calculate the total duration of the test
		totalTime = endTime - startTime

		# Set the test duration in the result
		responseData['vthResponse']['testDurationMS'] = totalTime

		responseData['vthResponse']['abstractMessage'] = 'Result from pinging {host}'.format(host = testData['targetHost'])
		app.logger.info('ping endpoint. response: ' + str(responseData))

		return jsonify(responseData)
	except Exception as e:
		app.logger.info(e)
		responseData['vthResponse']['abstractMessage'] = str(e)
		resp = make_response(json.dumps(responseData))
		endTime = unix_time_millis(datetime.datetime.now())

		totalTime = endTime - startTime
		return resp

if __name__ == '__main__':
	logHandler = FileHandler('otf/logs/pingVTH.log', mode='a')
	# logHandler = FileHandler('pingVTH.log', mode='a')
	logHandler.setLevel(logging.INFO)
	app.logger.setLevel(logging.INFO)
	app.logger.addHandler(logHandler)
	context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
	app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
	# app.run(debug = False, host = '0.0.0.0', port = 5000)

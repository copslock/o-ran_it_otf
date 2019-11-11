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

import datetime
import json
import logging
from logging import FileHandler
import os

import requests
from flask import Flask, request, jsonify

#redirect http to https
app = Flask(__name__)


# Prevents print statement every time an endpoint is triggered.
logging.getLogger("werkzeug").setLevel(logging.WARNING)

def unix_time_millis(dt):
	epoch = datetime.datetime.utcfromtimestamp(0)
	return (dt - epoch).total_seconds() * 1000.0


@app.route("/otf/vth/oran/v1/health", methods=['GET'])
def getHealth():
	return "UP"

@app.route("/otf/vth/oran/ric/v1", methods =['POST'])
def executeRicRequest():

	responseData = {
		'vthResponse': {
			'testDuration': '',
			'dateTimeUTC': datetime.datetime.now(),
			'abstractMessage': '',
			'resultData': {}
		}
	}

	startTime = unix_time_millis(datetime.datetime.now())

	try:
		if not request.is_json:
			raise ValueError("request must be json")

		requestData = request.get_json()

		app.logger.info("Ric requestData:"+str(requestData))

		action = requestData['action'].lower()
		possibleActions = ['alive','ready','list', 'deploy','delete']
		responseData['vthResponse']['abstractMessage'] = 'Result from {}'.format(action)

		if action not in possibleActions:
			raise KeyError("invalid action")
		if (action == 'deploy' or action == 'delete') and 'name' not in requestData:
			raise KeyError("must include name")

		with open('config.json') as configFile:
			config = json.load(configFile)

		baseAddress=  config['base_address']

		if action == 'alive' or action == 'ready':
			res = requests.get(baseAddress+config['actions_path'][action])
			responseData['vthResponse']['resultData']['statusCode'] = res.status_code
			responseData['vthResponse']['resultData']['resultOutput'] = res.text
		elif action == 'list':
			res = requests.get(baseAddress+config['actions_path'][action])
			responseData['vthResponse']['resultData']['statusCode'] = res.status_code
			responseData['vthResponse']['resultData']['resultOutput'] = res.json()
		elif action == 'deploy':
			payload = json.dumps({'name': requestData['name']})
			res = requests.post(baseAddress+config['actions_path'][action], data=payload)
			responseData['vthResponse']['resultData']['statusCode'] = res.status_code
			responseData['vthResponse']['resultData']['resultOutput'] = res.json()
		elif action == 'delete':
			path= baseAddress+config['actions_path'][action]+"{}".format(requestData['name'])
			res = requests.delete(path)
			responseData['vthResponse']['resultData']['resultOutput'] = res.text
			responseData['vthResponse']['resultData']['statusCode'] = res.status_code

	except Exception as ex:
		endTime = unix_time_millis(datetime.datetime.now())
		totalTime = endTime - startTime
		responseData['vthResponse']['testDuration'] = totalTime
		responseData['vthResponse']['abstractMessage'] = str(ex)
		return jsonify(responseData)

	endTime = unix_time_millis(datetime.datetime.now())
	totalTime= endTime-startTime

	responseData['vthResponse']['testDuration'] = totalTime

	return jsonify(responseData),200

if __name__ == '__main__':
	# logHandler = FileHandler('otf/logs/pingVTH.log', mode='a')
	logHandler = FileHandler('ricVTH.log', mode='a')
	logHandler.setLevel(logging.INFO)
	app.logger.setLevel(logging.INFO)
	app.logger.addHandler(logHandler)
	# context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
	# app.run(debug = False, host = '0.0.0.0', port = 5000, ssl_context = context)
	app.run(debug = False, host = '0.0.0.0', port = 5000)

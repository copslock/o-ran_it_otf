/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
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
##############################################################################*/


const config = require('../config/default.json');
const btoa = require('btoa');

module.exports.parser = function (response) {
	var jsonObject = {
		data: [],
		status: ''
	};

	if (response.result) {
		// loop through musics rusults and make it into an array
		for (var key in response.result) {
			if (response.result.hasOwnProperty(key)) {
				jsonObject.data.push(response.result[key]);
			}
		}
	}

	// set store status in new reponse
	jsonObject.status = response.status;

	return jsonObject;
};

module.exports.stringifyParams = function (params) {
	var string = '';
	var count = 0;

	for (var key in params.query) {
		if (params.query.hasOwnProperty(key) && key[0] != '$') {
			if (count > 0) {
				string += '&&';
			}
			string += key + '=' + params.query[key];
			count++;
		}
	}

	return string;
};

module.exports.musicHeaders = {
	'Content-Type': 'application/json',
	'ns': config.music.ns,
	'X-minorVersion': config.music['X-minorVersion'],
	'X-patchVersion': config.music['X-patchVersion'],
	'Authorization': 'Basic ' + btoa(config.music.username + ':' + config.music.password)
};

module.exports.musicUrl = config.music.url;

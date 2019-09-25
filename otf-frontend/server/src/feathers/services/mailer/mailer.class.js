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


const axios = require('axios');
const Response = require('http-response-object');
const logger = require('../../../lib/logger');
const util = require('../../../lib/otf-util');
const beautify = require('json-beautify');
const sendmail = require('sendmail')();

class Service {
	constructor (options) {
		this.options = options || {};
	}

	// function getLink(type, hash) {
	// 	const url = 'http://localhost:443/' + type + '?token=' + hash
	// 	return url
	// }

	async find (params) {
		return [];
	}

	// Check process definition key to see if unique
	async get (id, params) {

	}

	async create (data, params) {

		//send initial email for verification
		//add token to user in database
		sendmail(data, function(err, reply) {
	      console.log(err && err.stack);
	    });


	}

	async update (id, data, params) {
		return data;
	}

	async patch (id, data, params) {
		return data;
	}

	async remove (id, params) {
		return { id };
	}

	async parseAndUpload (data, params, method) {

	}
}

module.exports = function (options) {
	return new Service(options);
};

module.exports.Service = Service;

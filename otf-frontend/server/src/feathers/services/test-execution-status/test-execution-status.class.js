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
const { parseString, Builder } = require('xml2js');
const pickleRick = require('pickle-rick');
const Response = require('http-response-object');
const request = require('request');
const util = require('../../../lib/otf-util');

/* eslint-disable no-unused-vars */
class Service {
	constructor (options) {
		this.options = options || {};
	}

	async find (params) {

	}

	// Check process definition key to see if unique
	async get (id, params) {
		// return await axios.get(this.options.app.get('camundaApi').url + 'otf/tcu/process-instance-completion-check/v1/' + id,
		// 	{
		// 		headers: {
		// 			Authorization: 'Basic ' +
		// 		util.base64Encode(
		// 			this.options.app.get('serviceApi').aafId + ':' +
		// 			this.options.app.get('serviceApi').aafPassword)
		// 		}
		// 	})
		// 	.then(result => {
		// 		return new Response(200, {}, result.data);
		// 	})
		// 	.catch(err => {
		// 		console.log(err);
		// 	});
		
		let options = {
			url: this.options.app.get('camundaApi').url + 'otf/tcu/process-instance-completion-check/v1/' + id,
			headers: {
				'Authorization': 'Basic ' + util.base64Encode(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword),
				'Content-Type': "application/json"
			},
			rejectUnauthorized: false
		}
		
		return await new Promise((resolve, reject) => {
			request.get(options, (err, res, body) => {
				if(err){
					reject(err);
				}
				if(res && res.body){
					res.body = JSON.parse(res.body);
				}
				resolve(res);
			});
		}).then(
			res => {
				return res;
			}
		).catch(
			err => {
				console.log(err);
			}
		);
	}

	async create (data, params) {
		if (Array.isArray(data)) {
			return Promise.all(data.map(current => this.create(current, params)));
		}
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

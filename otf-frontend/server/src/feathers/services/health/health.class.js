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


const Response = require('http-response-object');
const request = require('request');

/* eslint-disable no-unused-vars */
class Service {
	constructor (options) {
		this.options = options || {};
	}

	async find (params) {
		return new Response(200, {});
	}

	async get (id, params) {
		if(id == 'tcu-engine'){
			let options = {
				url: this.options.app.get('camundaApi').url + 'otf/health/v1',
				rejectUnauthorized: false
			}
			
			return await new Promise((resolve, reject) => {
				request.get(options, (err, res, body) => {
					if(err){
						reject(err);
					}
					resolve(res);
				});
			}).then(
				res => {
					return res;
				}
			).catch(
				err => {
					return new Response(500, {}, err);
				}
			);
		}else if(id == 'tcu-api'){
			let options = {
				url: this.options.app.get('serviceApi').url + 'health/v1',
				rejectUnauthorized: false
			}
			
			return await new Promise((resolve, reject) => {
				request.get(options, (err, res, body) => {
					if(err){
						reject(err);
					};
					resolve(res);
				});
			}).then(
				res => {
					return res;
				}
			).catch(
				err => {
					return new Response(500, {}, err);
				}
			);
		}else{
			return new Response(200, {});
		}
		
	}

	async create (data, params) {
		if (Array.isArray(data)) {
			return Promise.all(data.map(current => this.create(current, params)));
		}

		return new Response(200, {});
	}

	async update (id, data, params) {
		return new Response(200, {});
	}

	async patch (id, data, params) {
		return new Response(200, {});
	}

	async remove (id, params) {
		return new Response(200, {});
	}
}

module.exports = function (options) {
	return new Service(options);
};

module.exports.Service = Service;

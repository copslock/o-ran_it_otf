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


const request = require('request');
const Response = require('http-response-object');
const logger = require('../../../lib/logger');
const util = require('../../../lib/otf-util');
const errors = require('@feathersjs/errors');

class Service {
	constructor (options) {
		this.options = options || {};
	}

	async find (params) {
		return [];
    }
    
	async get (id, params) {

	}

	async create (data, params) {
		
        let id = data._id;
		delete data._id;
		delete data.createdBy;
		
        let options = {
			url: this.options.app.get('serviceApi').url + 'testInstance/execute/v1/id/' + id,
			headers: {
				'Authorization': 'Basic ' + util.base64Encode(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword),
				'Content-Type': "application/json"
			},
            rejectUnauthorized: false,
            body: JSON.stringify(data)
		}

		return await new Promise((resolve, reject) => {
			request.post(options, (err, res, body) => {
				if(err){
					reject(err);
				}
				if(res.body){
					res.body = JSON.parse(res.body);
					if(res.body.statusCode != 200){
						reject(res.body);
					}
					resolve(res.body);
				}else{
					reject(res);
				}
				
			});
		}).then(
			res => {
                return res;
            }
		).catch(
			err => {
				return err;
			}
		);
	}

	async update (id, data, params) {
		return data;
	}

	async patch (id, data, params) {
		return data;
	}

	async remove (id, params) {

		let execution = await this.options.app.services[this.options.app.get('base-path') + 'test-executions'].get(id, { query: { $select: ['processInstanceId']}});
		
		if(!execution.processInstanceId){
			throw new errors.GeneralError('Could not find the execution process instance id');
		}

		let options = {
			url: this.options.app.get('camundaApi').url + 'otf/tcu/delete-process-instance/v1/' + execution.processInstanceId,
			headers: {
				'Authorization': 'Basic ' + util.base64Encode(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword),
				'Content-Type': "application/json"
			},
			rejectUnauthorized: false
		}

		return await new Promise((resolve, reject) => {
			request.delete(options, (err, res, body) => {
				if(err){
					reject(err);
				}
				if(res.body){
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


}

module.exports = function (options) {
	return new Service(options);
};

module.exports.Service = Service;

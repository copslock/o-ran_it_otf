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
const Bpmn = require('./bpmn.class');
const Readable = require('stream').Readable;
const request = require('request');

class Service {
	constructor (options) {
		this.options = options || {};
	}

	async find (params) {
		return [];
	}

	// Check process definition key to see if unique
	async get (id, params) {
		let errors = {};
		// Get List of Definition keys from Camunda
		let options = {
			url: this.options.app.get('camundaApi').url + 'otf/tcu/testDefinition/v1/processDefinitionKey/' + id,
			headers: {
				'Authorization': 'Basic ' + new Buffer(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword).toString('base64')
			},
			rejectUnauthorized: false
		};

		return await new Promise(async (resolve, reject) => {
			request.get(options, (err, response, body) => {
				if(err){
					reject(err);
				}
				resolve(response);
			});
		})
		.then(
			result => {
				if (result.statusCode == 200) {
					//check to make sure they have access
					params.query.$limit = '-1';
					params.query.processDefinitionKey = id;
					return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(params).then(
						res => {
							if(res.length > 0){
								return new Response(200, {}, res);
							}else{
								let resp = new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}});
								return resp;
							}
						}
					);
				}else{
					return new Response(200, {});
				}
			}
		).catch(err => {
			return new Response(400, {});
		});

		// return await axios.get(
		// 	this.options.app.get('camundaApi').url + 'otf/tcu/testDefinition/v1/processDefinitionKey/' + id,
		// 	{
		// 		headers: {
		// 			Authorization: 'Basic ' + new Buffer(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword).toString('base64')
		// 		}
		// 	})
		// 	.then(result => {
		// 		console.log(result);
		// 		if (result.status === 200) {
		// 			//check to make sure they have access
		// 			params.query.$limit = '-1';
		// 			params.query.processDefinitionKey = id;
		// 			return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(params).then(
		// 				res => {
		// 					console.log('res 1');
		// 					console.log(res);
		// 					if(res.length > 0){
		// 						return new Response(200, {}, res);
		// 					}else{

		// 						console.log('err 1');
		// 						let resp = new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}});
		// 						console.log(resp);
		// 						return resp;
		// 					}
		// 				}
		// 			);
		// 		}else{
		// 			console.log('not 200')
		// 			return new Response(400, {}, {errors: errors});
		// 		}
		// 	})
		// 	.catch(err => {
		// 		return new Response(200, {});
		// 	});
	}
	// async get (id, params) {
	// 	console.log("bpmn-upload: get")
	// 	let errors = {};
	// 	// Get List of Definition keys from Camunda

	// 	// let options = {
	// 	// 	url: this.options.app.get('camundaApi').url + 'otf/tcu/testDefinition/v1/processDefinitionKey/' + id,
	// 	// 	headers: {
	// 	// 		'Authorization': 'Basic ' + new Buffer(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword).toString('base64')
	// 	// 	},
	// 	// 	rejectUnauthorized: false
	// 	// }

	// 	// return await new Promise((resolve, reject) => {
	// 	// 	request.post(options, (err, res, body) => {
	// 	// 		if(err){
	// 	// 			reject(err);
	// 	// 		}
	// 	// 		resolve(res);
	// 	// 	});
	// 	// }).then(
	// 	// 	result => {
	// 	// 		console.log(result);
	// 	// 		if (result.statusCode === 200) {
	// 	// 			//check to make sure they have access
	// 	// 			params.query.$limit = '-1';
	// 	// 			params.query.processDefinitionKey = id;
	// 	// 			return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(params).then(
	// 	// 				res => {
	// 	// 					return new Response(200, {}, res);
	// 	// 				},
	// 	// 				err => {
	// 	// 					return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 	// 				}
	// 	// 			);
	// 	// 		}else if(result.statusCode == 404){
	// 	// 			return new Response(400, {}, {errors: errors});
	// 	// 		}else{
	// 	// 			return new Response(result.statusCode, {}, {errors: errors});
	// 	// 		}
	// 	// 	}
	// 	// ).catch(
	// 	// 	err => {
	// 	// 		console.log("Err: " + err)
	// 	// 		//return new Response(200, {});
	// 	// 		let newParams = Object.assign({}, params);
	// 	// 		newParams.query.$limit = -1;
	// 	// 		newParams.query.processDefinitionKey = id;
	// 	// 		//console.log(params);
	// 	// 		return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(newParams).then(
	// 	// 			res => {
	// 	// 				//return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 	// 				return new Response(200, {}, res);
	// 	// 			},
	// 	// 			err => {
	// 	// 				return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 	// 			}
	// 	// 		);
	// 	// 	}
	// 	// );

	// 	return await axios.get(
	// 		this.options.app.get('camundaApi').url + 'otf/tcu/testDefinition/v1/processDefinitionKey/' + id,
	// 		{
	// 			headers: {
	// 				Authorization: 'Basic ' + new Buffer(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword).toString('base64')
	// 			}
	// 		})
	// 		.then(result => {
	// 			console.log(result);
	// 			if (result.status === 200) {
	// 				console.log('in here')
	// 				//check to make sure they have access
	// 				params.query.$limit = '-1';
	// 				params.query.processDefinitionKey = id;
	// 				return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(params).then(
	// 					res => {
	// 						return new Response(200, {}, res);
	// 					}
	// 				).catch(err => {
	// 					console.log('err')
	// 					return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 				});
	// 			}else if(result.status === 404){
	// 				console.log('or here')
	// 				return new Response(400, {}, {errors: errors});
	// 			}else{
	// 				return new Response(result.status, {}, {errors: errors});
	// 			}
	// 		})
	// 		.catch(err => {
	// 			console.log("Err: " + err)
	// 			//return new Response(200, {});
	// 			let newParams = Object.assign({}, params);
	// 			newParams.query.$limit = -1;
	// 			newParams.query.processDefinitionKey = id;
	// 			//console.log(params);
	// 			return this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].find(newParams).then(
	// 				res => {
	// 					//return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 					return new Response(200, {}, res);
	// 				}
	// 			).catch(err => {
	// 				console.log('err 2')
	// 				return new Response(400, {}, {errors: {processDefinitionKey: 'You do not have access to this process definition key'}})
	// 			});
	// 		});
	// }

	async create (data, params) {
		let bpmn = new Bpmn(this.options.app, data, params);
		return await bpmn.validate();
	}

	//validates then saves bpmn file and returns file meta data
	async update (id, data, params) {
		let bpmn = new Bpmn(this.options.app, data, params);
		let res = await bpmn.validate();
		if(res.statusCode != 200){
			return res;
		}
		
		let b = new Buffer(res.body.bpmnXml);
		let r = new Readable();
		r.push(b);
		r.push(null);
		//save new bpmn file and return
		let formData = {
			'file': {
				value: r.read(),
				options: {
					filename: res.body.processDefinitionKey + '.bpmn'
				}
			}
		};
		let options = {
			uri: this.options.app.get('otf').url + this.options.app.get('base-path') + 'file-transfer',
			headers: {
				'Authorization': params.headers.Authorization,
				'Content-Type': "multipart/form-data"
			},
			rejectUnauthorized: false,
			formData: formData
		}

		return await new Promise((resolve, reject) => {
			request.post(options, (err, res, body) => {
				if(err){
					reject(err);
				}
				resolve(body);
			});
		}).then(
			result => {
				return result;
			}
		).catch(
			err => {
				return err;
			}
		);

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

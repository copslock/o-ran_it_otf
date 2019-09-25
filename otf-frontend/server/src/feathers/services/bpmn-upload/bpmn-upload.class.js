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
const pickleRick = require('pickle-rick');
const Response = require('http-response-object');
const logger = require('../../../lib/logger');
const util = require('../../../lib/otf-util');
const Readable = require('stream').Readable;
const request = require('request');

class Service {
	constructor(options) {
		this.options = options || {};
	}

	async find(params) {
		return [];
	}

	async get(id, params) {
		return {
			id, text: `A new message with ID: ${id}!`
		};
	}

	async create(data, params) {
		if (Array.isArray(data)) {
			return Promise.all(data.map(current => this.create(current, params)));
		}

		data.deploying = true;

		//let formData = new FormData();
		let formData = {};
		//prepare multipart form data
		//formData.append('testDefinitionDeployerId', JSON.stringify(params.user._id));
		formData['testDefinitionDeployerId'] = JSON.stringify(params.user._id);
		if (data.testDefinition._id) {
			//formData.append('testDefinitionId', JSON.stringify(data.testDefinition._id));
			formData['testDefinitionId'] = JSON.stringify(data.testDefinition._id);
		}

		//If version was supplied change current version
		if(data.version != null && data.version != undefined){
			data.testDefinition.currentVersion = data.testDefinition.bpmnInstances.findIndex(e => e.version == data.version);
		}

		//get bpmnfile
		await this.options.app.services[this.options.app.get('base-path') + 'file-transfer'].get(data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].bpmnFileId)
			.then(result => {
				// let b = new Buffer(result);
				// console.log(b.toString())
				let s = new Readable();

				s.push(result);
				s.push(null);
				formData['bpmn'] = s.read();
				// s.pipe(formData['bpmn']);
				
			}).catch(err => {
				console.log(err);
			});


		//get resource zip file
		if (data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].resourceFileId) {
			await this.options.app.services[this.options.app.get('base-path') + 'file-transfer'].get(data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].resourceFileId)
				.then(result => {
					//let b = new Buffer(result);
					let s = new Readable();

					s.push(result);
					s.push(null);
					
					formData['resources'] = s.read();
					//formData.append('resource', s);

				}).catch(err => {
					console.log(err);
				});
		}

		//prepare request
		let options = {
			url: this.options.app.get('serviceApi').url + 'testStrategy/deploy/v1',
			headers: {
				'Authorization': 'Basic ' + util.base64Encode(this.options.app.get('serviceApi').aafId + ':' + this.options.app.get('serviceApi').aafPassword),
				'Content-Type': "multipart/form-data"
			},
			rejectUnauthorized: false,
			formData: formData
		}
		let deployed = false;
		let deployedDefinition;
		let response;
		await new Promise((resolve, reject) => {
			request.post(options, (err, res, body) => {
				response = res || err;
				if(err){
					reject(err);
				}
				if(res && res.statusCode == 200){
					deployed = true;
					resolve(body);
				}else{
					reject(res);
				}
			});
		}).then(
			result => {
				if(result){
					deployedDefinition = JSON.parse(result);
				}
			}
		).catch(
			err => {
				console.log(err.body);
			}
		);
		if (!deployed) {
			pickleRick();
			return new Response(500, {}, { errors: { deployment: 'The bpmn file failed to deploy on the server.' } });
		}

		// Since test head objects are sent, we only store the test head id. this for loop adds those to the object to save
		// for (let i = 0; i < data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].testHeads.length; i++) {
		// 	data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].testHeads[i].testHeadId = data.testDefinition.bpmnInstances[data.testDefinition.currentVersion].testHeads[i].testHead._id;
		// }

		// let td = await this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].create(data.testDefinition, params)
		//     .then(result => {
		//         return result['data'];
		//     })
		//     .catch(err => {
		//         console.log(err);
		//     }
		// Set as deployed
		delete params.query;

		//check to see if the process definition Key was set
		// if (!data.testDefinition.processDefinitionKey) {
		// 	data.testDefinition.processDefinitionKey = validated.body.processDefinitionKey;
		// }
		let td = await this.options.app.services[this.options.app.get('base-path') + 'test-definitions'].patch(data.testDefinition._id, {
			$set:{
				['bpmnInstances.' + data.testDefinition.currentVersion + '.isDeployed']: true,
				['bpmnInstances.' + data.testDefinition.currentVersion + '.processDefinitionId']: deployedDefinition['processDefinitionId'],
				['bpmnInstances.' + data.testDefinition.currentVersion + '.deploymentId']: deployedDefinition['deploymentId']
			}
		}, params)
			.then(result => {
				return result;
			})
			.catch(err => {
				logger.error(err);
			});

		return new Response(200, {}, {
			//bpmnVthTaskIds: validated.body.bpmnVthTaskIds,
			//errors: validated.body.errors,
			testDefinition: td
		});
	}

	async update(id, data, params) {
		return data;
	}

	async patch(id, data, params) {
		return data;
	}

	async remove(id, params) {
		return { id };
	}
}

module.exports = function (options) {
	return new Service(options);
};

module.exports.Service = Service;

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


const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, disallow } = require('feathers-hooks-common');
const logger = require('../../../lib/logger');
const request = require('request-promise');
const agendaJobPopulate = require('../../hooks/agendaJobPopulate');
const utils = require('../../../lib/otf-util');
const axios = require('axios');
const util = require('../../../lib/otf-util');
const checkLocks = require('../../hooks/checkLocks');
const { permissions, limitFields } = require('../../hooks/permissions/permissions');
const errors = require('@feathersjs/errors');

const canExecute = function(){
	return async (context) => {
		let id = context.id || context.data.testInstanceId;

		let testInstanceId = id;

		if(context.method == 'remove'){
			let job = await context.app.services[context.app.get('base-path') + 'jobs'].get(id, {provider: undefined});
			console.log(job)
			testInstanceId = job.data.testSchedule._testInstanceId;
			console.log(testInstanceId)
		}

		//get group id of the test instance that is being executed
		let testInstance = await context.app.services[context.app.get('base-path') + 'test-instances'].get(testInstanceId, {provider: undefined, query: { $select: ['groupId', 'testDefinitionId', 'disabled'] } });

		//check if its locked
		let testDefinition = await context.app.services[context.app.get('base-path') + 'test-definitions'].get(testInstance.testDefinitionId, {provider: undefined, query: { $select: ['disabled'] } });

		if((testInstance.disabled || testDefinition.disabled) && context.method == 'create'){
			throw new errors.Unavailable('The test instance or definition is locked.');
		}

		testInstance = new context.app.services[context.app.get('base-path') + 'test-instances'].Model(testInstance);
		if(context.params.ability.cannot('execute', testInstance)){
			throw new errors.Forbidden(`You are not allowed to execute this instance.`);
		}
	}
}

module.exports = {
	before: {
		all: [authenticate('jwt')],
		find: [
			async function(context){
				if(context.params.query.testInstanceId){
					const mongoose = context.app.get('mongooseClient');
					const toObjectId = v => mongoose.Types.ObjectId(v);

					let Model = context.app.service(context.app.get('base-path') + 'jobs').Model;
					const conditions = [{
						$match:{
							 "data.testSchedule._testInstanceId": toObjectId(context.params.query.testInstanceId),
							 "nextRunAt":  {
								 $ne: null
							 }//{
							// 	"testSchedule": {
							// 		"_testInstanceId": toObjectId(context.params.query.testInstanceId)
							// 	}
							// }
						}
					}];

					await new Promise(function(resolve, reject){
						Model.aggregate(conditions).exec(function(error, result){
							if(error){
								reject(error);
							}
							resolve(result);
						});
					}).then(result => {
						if(result.length){
							if(result.length == 1){
								context.params.query._id = result[0]._id;
							}else if(result.length == 0){
								//do nothing
							}else{
								let ids = [];
								result.forEach(elem => {
									ids.push(elem._id);
								});
								context.params.query._id = {
									$in: ids
								}
							}
						}else{
							context.params.query._id = result._id;
						}
					}).catch(err => {
						console.log(err);
					});

					delete context.params.query.testInstanceId;
				}
				return context;
			}
		],
		get: [],
		create: [
			permissions('jobs'),
			(context) => { console.log("AFTER PERMISSIONS")},
			canExecute(), 
			async (context) => {
				const fullUrl = context.app.get('otf').url + context.app.get('base-path') + 'schedule-test';

				context.data.executorId = context.params.user._id;

				await request({
					method: 'post',
					url: fullUrl,
					body: JSON.stringify(context.data),
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Basic ' +
							util.base64Encode(
								context.app.get('serviceApi').aafId + ':' +
								context.app.get('serviceApi').aafPassword)
					},
					rejectUnauthorized: false
				}, function (err, res, body) {
					if (err) {
						logger.error(err);
					}

					if (body) {
						context.result = JSON.parse(body);
					}

				});

				return context;
			}
		],
		update: [],
		patch: [],
		remove: [
			permissions('jobs'),
			canExecute(),
			async function (context) {
			const fullUrl = context.app.get('otf').url + context.app.get('base-path') + 'cancel-test';

			if (context.id == null || context.params.user._id == null ||
				utils.isValidObjectId(context.id) || utils.isValidObjectId(context.params.user._id)) {
				context.result = {
					status: 400,
					message: 'Request is invalid.'
				};
			}

			const postData = {
				jobId: context.id,
				executorId: context.params.user._id
			};

			// console.log(JSON.stringify(postData));

			await request({
				method: 'post',
				url: fullUrl,
				body: JSON.stringify(postData),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' +
						util.base64Encode(
							context.app.get('serviceApi').aafId + ':' +
							context.app.get('serviceApi').aafPassword)
				},
				rejectUnauthorized: false
			}, function (err, res, body) {
				if (err) {
					logger.error(err);
				}

				context.result = JSON.parse(body);
			});

			return context;
		}]
	},

	after: {
		all: [],
		find: [agendaJobPopulate()],
		get: [agendaJobPopulate()],
		create: [],
		update: [],
		patch: [],
		remove: []
	},

	error: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: []
	}
};

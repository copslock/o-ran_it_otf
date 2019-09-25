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
const { permissions, limitFields } = require('../../hooks/permissions/permissions');
const errors = require('@feathersjs/errors');
const throwError = require('../../hooks/throw');
const { disallow } = require('feathers-hooks-common');
const canExecute = function(){
	return async (context) => {
		let id = context.id || context.data._id;
		//must have an _id
		if(!id){
			if(context.method == 'create')
				throw new errors.BadRequest("'_id' and 'asyncTopic' is required to execute a test instance");
			else
				throw new errors.BadRequest("An id must be provided to cancel an execution")
		}

		let testInstanceId = id;

		if(context.method == 'remove'){
			let execution = await context.app.services[context.app.get('base-path') + 'test-executions'].get(id, {provider: undefined, query: { $select: ['historicTestInstance._id']}});
			testInstanceId = execution.historicTestInstance._id;
		}

		//get group id of the test instance that is being executed
		let testInstance = await context.app.services[context.app.get('base-path') + 'test-instances'].get(testInstanceId, {query: { $select: ['groupId', 'testDefinitionId', 'disabled'] } });

		//check if its locked
		let testDefinition = await context.app.services[context.app.get('base-path') + 'test-definitions'].get(testInstance.testDefinitionId, {query: { $select: ['disabled'] } });

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
		all: [authenticate('jwt'), permissions('execute')],
		find: [ throwError(new errors.MethodNotAllowed()) ],
		get: [ throwError(new errors.MethodNotAllowed())],
		create: [
			(context) => {
				context.data.executorId = context.params.user._id;
				return context;
			},
			canExecute()
		],
		update: [ throwError(new errors.MethodNotAllowed()) ],
		patch: [ throwError(new errors.MethodNotAllowed()) ],
		remove: [canExecute()]
	},

	after: {
		all: [],
		find: [],
		get: [],
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

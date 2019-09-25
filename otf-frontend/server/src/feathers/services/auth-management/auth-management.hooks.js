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


const commonHooks = require('feathers-hooks-common');

module.exports = {
	before: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [
			commonHooks.iff(
			commonHooks.isProvider('external'),
			commonHooks.preventChanges(
				'email',
				'isVerified',
				'verifyToken',
				'verifyShortToken',
				'verifyExpires',
				'verifyChanges',
				'resetToken',
				'resetShortToken',
				'resetExpires'
			))],
		patch: [],
		remove: []
	},

	after: {
		all: [],
		find: [],
		get: [],
		create: [
			function(context){
				if(context.result['isVerified']){
					context.result = {};
					return context;
				}
				return context;
			}
		],
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

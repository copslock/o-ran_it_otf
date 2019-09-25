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
const filter = require('../../hooks/filters.js');
const checkPermissions = require('feathers-permissions');
const authManagement = require('../auth-management/notifier');
const errors = require('@feathersjs/errors');

const {
	hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;
const { iff, disallow } = require('feathers-hooks-common'); 
const verifyHooks = require('feathers-authentication-management').hooks;
const skip = require('@feathersjs/feathers').SKIP;

const { permissions, limitFields } = require('../../hooks/permissions/permissions');

module.exports = {
	before: {
		all: [],
		find: [
			authenticate('jwt'),
			permissions('users'),
			function(context){
				if(!context.params.user){
					return skip;
				}
			}
		],
		get: [
			authenticate('jwt'),
			permissions('users'),
			function(context){
				if(!context.params.user){
					return skip;
				}
			}
		],
		create: [hashPassword(),
				function(context){
					return verifyHooks.addVerification(context.app.get('base-path') + 'authManagement')(context);
				},
				function (context) {
					context.data.enabled = false;
					// await context.app.services[context.app.get('base-path') + 'groups']
					// .find({
					// 	query : {
					// 		groupName: "Public"
					// 	}
					// })
					// .then( result => {	
					// 	if(result){
					// 		await context.app.services[context.app.get('base-path') + 'groups']
					// 		.patch({
					// 			_id : result._id,
                    //     		$push: { members: { userId : user._id, roles: ["user"]}}
					// 		});
					// 	}
					// });
					context.data.groups = [
						{
							groupId: '5bdb2bdbd6b0d1f97953fbd7',
							permissions: [
								'admin'
							]
						}
					];

				}
		],
		update: [
			hashPassword(),
			authenticate('jwt'),
			permissions('users')
		],
		patch:
			[

				hashPassword(),
				authenticate('jwt'),
				iff(context => context.params.provider === undefined).else(
					permissions('users'),
					async function(context){
						if(context.data.enabled){
							 await this.get(context.id)
								.then(function(user) {
									if(!user.enabled){
										context.sendEmail = true;

									}
								});
						}
					}
				)
			// commonHooks
			// 	.iff(checkPermissions({
			// 		roles: [ 'admin' ]
			// 	}))
			// 	.else(commonHooks.iff(
			// 		commonHooks.isProvider('external'),
			// 		commonHooks.preventChanges(
			// 			'email',
			// 			'isVerified',
			// 			'verifyToken',
			// 			'verifyShortToken',
			// 			'verifyExpires',
			// 			'verifyChanges',
			// 			'resetToken',
			// 			'resetShortToken',
			// 			'resetExpires'
			// 		)
			// 	))
		],
		remove: [
			authenticate('jwt'),
			permissions('users')
		]
	},

	after: {
		all: [
			// Make sure the password field is never sent to the client
			// Always must be the last hook
			protect('password'),
		],
		find: [iff(context => context.params.provider === undefined).else(limitFields())],
		get: [iff(context => context.params.provider === undefined).else(limitFields())],
		create: [
			context => {
				authManagement(context.app).notifier('resendVerifySignup', context.result);
			},
			function (context) {
				
				// await context.app.services[context.app.get('base-path') + 'groups']
				// .get(context.data.parentGroupId, context.params)
				// .then( result => {	
				// 	group = result;
				// });
			},
			verifyHooks.removeVerification()
		],
		update: [iff(context => context.params.provider === undefined).else(limitFields())],
		patch: [iff(context => context.params.provider === undefined).else(limitFields()),
			context => {
				let data = context['data']
				if(data && context.sendEmail){
					let enabled = data['enabled'];
						if(enabled){
							authManagement(context.app).notifier('sendApprovalNotification', context.result)

						}
				}
			}
		],
		remove: [iff(context => context.params.provider === undefined).else(limitFields())]
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

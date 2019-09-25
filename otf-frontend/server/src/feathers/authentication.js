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


const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
const { permissions } = require('./hooks/permissions/permissions');
// const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

module.exports = function (app) {
	const config = app.get('authentication');

	// Set up authentication with the secret
	app.configure(authentication(config));
	app.configure(jwt());
	app.configure(local());

	// The `authentication` service is used to create a JWT.
	// The before `create` hook registers strategies that can be used
	// to create a new valid JWT (e.g. local or oauth2)
	app.service(config.path).hooks({
		before: {
			create: [
				function(context){
					 //console.log(context.data)
					// console.log('authing');
				},
				authentication.hooks.authenticate(config.strategies),
				permissions('authentication')
			],
			remove: [
				authentication.hooks.authenticate('jwt')
			]
		},
		after: {
			create: [
				// Send the user profile back with access token
				async function (context) {
					if (!context.params.user.enabled) {
						context.result.accessToken = null;
					}

					context.result['user'] = context.params.user;

					//Send Back the users rules
					if(context.params.ability){
						context.result.user['rules'] = context.params.ability.rules;
					}

					delete context.result.user.password;
					return context;
				}
			]
		}
	});
};

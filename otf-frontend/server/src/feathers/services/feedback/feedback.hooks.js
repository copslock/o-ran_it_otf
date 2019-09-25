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
const { disallow } = require('feathers-hooks-common');

module.exports = {
	before: {
		all: [ ],
		find: [],
		get: [],
		create: [
			authenticate('jwt'),
			context => {
				let sender = context.app.get('otf').email;
				let data = context.data['data'];
				let message = data['message'];
				let user = context.params.user;

				let feedback = "Email: " + user['email'] + "</br>" +
								"First Name: " + user['firstName'] + "</br>" +
								"Last Name: " + user['lastName'] + "</br>" +
								"Message: " + message + "</br>" +
								"Date: " + new Date();
					let email = {
					from: sender,
					to: sender,
					subject: 'Feedback',
					html: feedback
				}

				return context.app.service(context.app.get('base-path') + 'mailer').create(email).then(function (result) {
					console.log('Sent email', result)
				}).catch(err => {
					console.log('Error sending email: ', email, err)
				})


			}
		],
		update: [],
		patch: [],
		remove: []
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

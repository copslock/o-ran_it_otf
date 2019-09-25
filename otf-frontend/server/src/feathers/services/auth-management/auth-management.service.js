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


// Initializes the `authmanagement` service on path `/authmanagement`
// this service is used for user verification and management
const authManagement = require('feathers-authentication-management');
const hooks = require('./auth-management.hooks.js');
const notifier = require('./notifier.js');

module.exports = function (app) {

	// Initialize our service with any options it requires
	app.configure(authManagement({
		path: app.get('base-path') + 'authManagement',
		notifier: notifier(app).notifier,
		service: app.get('base-path') + 'users'
	}));

	// Get our initialized service so that we can register hooks and filters
	const service = app.service(app.get('base-path') + 'authManagement');

	service.hooks(hooks);
};

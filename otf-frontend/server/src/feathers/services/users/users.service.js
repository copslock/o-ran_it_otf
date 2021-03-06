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


// Initializes the `users` service on path `/users`
const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

const RateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

module.exports = function (app) {
	const Model = createModel(app);
	const paginate = app.get('paginate');

	const options = {
		Model,
		paginate
	};

	const mongoConfig = app.get('mongo');
	const rateLimitConfig = app.get('rate-limit');

	const createUserLimiter = new RateLimit({
		store: new MongoStore({
			uri: 'mongodb://' + mongoConfig.username + ':' + mongoConfig.password + '@' + mongoConfig.baseUrl +
				mongoConfig.dbOtf + '?replicaSet=' + mongoConfig.replicaSet,
			collectionName: rateLimitConfig.mongoStore.collection
		}),
		max: app.get('rate-limit').services.users.max,
		windowsMs: app.get('rate-limit').services.users.windowMs,
		message: app.get('rate-limit').services.users.message
	});

	// Initialize our service with any options it requires,
	// and limit any POST methods.
	app.use(app.get('base-path') + 'users', (req, res, next) => {
		if (req.method === 'POST') {
			createUserLimiter(req, res, next);
		} else {
			next();
		}
	}, createService(options));

	// Get our initialized service so that we can register hooks
	const service = app.service(app.get('base-path') + 'users');

	service.hooks(hooks);
};

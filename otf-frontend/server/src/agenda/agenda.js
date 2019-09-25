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


const logger = require('../lib/logger');
const Agenda = require('agenda');
const mongoData = require('config').mongo;
const jobTypes = ['test-execution-job'];
const agenda = new Agenda({
	db: {
		address: 'mongodb://' + mongoData.username + ':' + mongoData.password + '@' + mongoData.baseUrl + mongoData.dbOtf + '?replicaSet=' + mongoData.replicaSet,
		collection: 'agenda'
	}
});

module.exports = {
	agenda: agenda,
	initializeAgenda: function () {
		// Load all job types
		jobTypes.forEach(type => {
			require('./jobs/' + type)(agenda);
		});

		// Wait for the db connection to be established before starting agenda (sync).
		agenda.on('ready', function () {
			logger.debug('Agenda successfully established a connection to MongoDB.');
			agenda.start();
			// agenda.processEvery('0.001 seconds');
		});

		async function graceful () {
			await agenda.stop();
			process.exit(0);
		}

		process.on('SIGTERM', graceful);
		process.on('SIGINT', graceful);
	}
};

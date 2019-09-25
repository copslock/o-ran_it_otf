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


const cluster = require('cluster');
const os = require('os');

// Winston
const logger = require('./lib/logger');

const jobWorkers = [];
const expressWorkers = [];

process.env.NODE_CONFIG_DIR = './server/config';

// TODO: Do we need this
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const env = process.env['ENV'];
const validEnvs = ['production', 'development', 'system_test', 'local'];

if (env === undefined) {
	logger.error('The process environment is not set, so the application will not start.\nPlease set the variable ' +
		'\'%s\' to one of the following values: %s', 'env', validEnvs);
	process.exit(1);
} else if (!validEnvs.includes(env)) {
	logger.error('%s is not a valid value.\nPlease set the environment variable \'%s\' to one of the following ' +
		'values: %s', env, 'env', validEnvs);
	process.exit(1);
}

// Workers can only be spawned on the master node.
if (cluster.isMaster) {
	// Use 8 CPU's on non-local environments, otherwise get the number of CPUs
	const numWorkers = (env === 'local') ? 1 : 8;

	logger.info('Master node is creating %d workers on the %s environment.', numWorkers, env);

	// Spawns a worker process for every CPU
	for (let i = 0; i < numWorkers; i++) {
		addExpressWorker();
		// Don't add job workers on local environments
		if (env === 'local') continue;
		addJobWorker();
	}

	// Listener for a spawned worker
	cluster.on('exit', (worker, code, signal) => {
		logger.info('Worker %d is online.', worker.process.pid);

		if (jobWorkers.indexOf(worker.id) !== -1) {
			console.log(`job worker ${worker.process.pid} exited (signal: ${signal}). Trying to respawn...`);
			removeJobWorker(worker.id);
			addJobWorker();
		}

		if (expressWorkers.indexOf(worker.id) !== -1) {
			console.log(`express worker ${worker.process.pid} exited (signal: ${signal}). Trying to respawn...`);
			removeExpressWorker(worker.id);
			addExpressWorker();
		}
	});
} else {
	if (process.env.express) {
		logger.info('Created express server process.');
		require('./feathers/index');
	}

	if (process.env.job) {
		logger.info('Created agenda job server process.');
		require('./agenda/agenda').initializeAgenda();
	}
}

function addExpressWorker () {
	expressWorkers.push(cluster.fork({ express: 1 }).id);
}

function addJobWorker () {
	jobWorkers.push(cluster.fork({ job: 1 }).id);
}

function removeExpressWorker (id) {
	expressWorkers.splice(expressWorkers.indexOf(id), 1);
}

function removeJobWorker (id) {
	jobWorkers.splice(jobWorkers.indexOf(id), 1);
}

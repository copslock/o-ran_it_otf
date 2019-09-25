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


const request = require('request');
const requestPromise = require('request-promise');
const logger = require('../../lib/logger');
const emitter = require('../result-emitter').emitter;
const config = require('config');

const loggerTagExecuteTestSync = '[JOB-sync] ';
const loggerTagExecuteTestAsync = '[JOB-async] ';

module.exports = function (agenda) {
	// [Job Definition] : Executes a testInstance synchronously.
	agenda.define('executeTestSync', (job) => {
		logger.debug(loggerTagExecuteTestSync + 'Running job %s.', job.attrs._id);

		// Extact the testSchedule from the job data.
		const testSchedule = job.attrs.data.testSchedule;

		logger.debug('[POST-' +
			config.serviceApi.url + config.serviceApi.uriExecuteTestInstance + testSchedule._testInstanceId + ']');

		// Create and send the request
		requestPromise.post({
			url: config.serviceApi.url + config.serviceApi.uriExecuteTestInstance + testSchedule._testInstanceId,
			headers: {
				'Authorization': job.attrs.data.authorizationHeader,
				'Content-Type': 'application/json'
			},
			body: {
				'async': false,
				'executorId': testSchedule._executorId
			},
			json: true
		}, function onResponseOk(response) {
			logger.debug('[POST-ok]: ' + JSON.stringify(response));
			emitter.emit(job.attrs._id + '_ok', response);
		}, function onResponseError(response) {
			logger.debug('[POST-error]: ' + JSON.stringify(response));
			emitter.emit(job.attrs._id + '_error', response);
		});
	});

	// [Job Definition] : Executes a testInstance asynchronously.
	agenda.define('executeTestAsync', (job, done) => {
		logger.debug(loggerTagExecuteTestAsync + 'Running job %s.', job.attrs._id);

		// Extact the testSchedule from the job data.
		const testSchedule = job.attrs.data.testSchedule;

		if (testSchedule._testInstanceEndDate) {
			const currentDate = Date.now().valueOf();
			const endDate = Date.parse(testSchedule._testInstanceEndDate).valueOf();

			if (currentDate >= endDate) {
				job.remove(err => {
					if (!err) {
						logger.debug('Job %s finished.', job.attrs._id);
					} else {
						logger.error(err);
					}
				});

				done();
				return;
			}
		}

		logger.debug('[POST-%s]', config.serviceApi.url + config.serviceApi.uriExecuteTestInstance + testSchedule._testInstanceId);

		// Create and send the request (we don't care about the response)
		request.post({
			url: config.serviceApi.url + config.serviceApi.uriExecuteTestInstance + testSchedule._testInstanceId,
			headers: {
				'Authorization': job.attrs.data.authorizationHeader,
				'Content-Type': 'application/json'
			},
			body: {
				'async': true,
				'executorId': testSchedule._executorId
			},
			json: true
		}, function onResponseOk(response) {
			logger.debug('[POST-ok]: ' + JSON.stringify(response));
			emitter.emit(job.attrs._id + '_ok', response);
		}, function onResponseError(response) {
			logger.debug('[POST-error]: ' + JSON.stringify(response));
			emitter.emit(job.attrs._id + '_error', response);
		});

		done();
	});

	agenda.define('executeTestOnInterval', (job, done) => {
		logger.debug('[JOB-executeTestOnInterval] running...');

		// Extact the testSchedule from the job data.
		const testSchedule = job.attrs.data.testSchedule;

		if (testSchedule._testInstanceEndDate) {
			if (new Date().now() > testSchedule._testInstanceEndDate) {
				job.remove((err) => {
					if (err) {
						logger.error(err); 
					}
				});
			}
		}

		logger.info('exec freq ' + testSchedule.testInstanceExecFreqInSeconds());

		agenda.every(
			testSchedule._testInstanceExecFreqInSeconds + ' seconds',
			'executeTestAsync',
			{testSchedule: job.attrs.data.testSchedule, authorizationHeader: job.attrs.data.authorizationHeader});

		done();
	});
};

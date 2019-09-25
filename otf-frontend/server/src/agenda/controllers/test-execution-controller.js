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


const logger = require('../../lib/logger');
const agenda = require('../agenda').agenda;
const emitter = require('../result-emitter').emitter;
const utils = require('../../lib/otf-util');
const nodeUtil = require('util');

const ObjectId = require('mongoose').Types.ObjectId;

const TestSchedule = require('../models/test-schedule');

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

module.exports = function (app) {
	let scheduleTestResponse = { status: '', message: '' };
	let cancelTestResponse = { status: '', message: '' };

	// Main endpoint for scheduling
	app.use('/' + app.get('base-path') + 'schedule-test', (req, res, next) => {
		const authorizationHeader = req.headers.authorization;

		const testInstanceId = req.body.testInstanceId;
		const testInstanceStartDate = req.body.testInstanceStartDate;
		const testInstanceExecFreqInSeconds = req.body.testInstanceExecFreqInSeconds;
		const testInstanceEndDate = req.body.testInstanceEndDate;
		const async = req.body.async;
		const asyncTopic = req.body.asyncTopic;
		const asyncMode = req.body.asyncMode;
		const executorId = req.body.executorId;

		let testSchedule = null;

		try {
			testSchedule = new TestSchedule(testInstanceId, testInstanceStartDate, testInstanceExecFreqInSeconds,
				testInstanceEndDate, async, asyncTopic, asyncMode, executorId);
		} catch (error) {
			scheduleTestResponse.status = 400;
			scheduleTestResponse.message = error.toString();
			next();

			return;
		}

		// The presence of this parameter indicates that we will be executing either job definition 2/3.
		if (testSchedule.testInstanceStartDate) {
			if (testSchedule.testInstanceExecFreqInSeconds) {
				const job = agenda.create(
					'executeTestAsync',
					{ testSchedule, authorizationHeader });
				job.schedule(testSchedule.testInstanceStartDate).repeatEvery(testSchedule.testInstanceExecFreqInSeconds + ' seconds', {
					timezone: timeZone
				});
				job.save().then(function onJobCreated (result) {
						logger.debug(JSON.stringify(result));
						scheduleTestResponse.status = 200;
						scheduleTestResponse.message = 'Successfully scheduled job.';
						next();
					})
					.catch(function onError (error) {
						logger.error(error);
						scheduleTestResponse.status = 500;
						scheduleTestResponse.message = 'Unable to schedule job.';
						next();
					});
			} else if (!testSchedule.testInstanceExecFreqInSeconds && !testSchedule.testInstanceEndDate) {
				agenda.schedule(
					testSchedule._testInstanceStartDate,
					'executeTestAsync',
					{ testSchedule, authorizationHeader })
					.then(function onJobCreated (result) {
						scheduleTestResponse.status = 200;
						scheduleTestResponse.message = 'Successfully scheduled job.';
						next();
					})
					.catch(function onError (error) {
						logger.error('error: ' + error);
						scheduleTestResponse.status = 500;
						scheduleTestResponse.message = 'Unable to schedule job.';
						next();
					});
				return;
			} else if (testSchedule.testInstanceEndDate && !testSchedule.testInstanceExecFreqInSeconds) {
				scheduleTestResponse.status = 400;
				scheduleTestResponse.message = 'Must specify \'testInstanceExecFreqInSeconds\' to use \'testInstanceEndDate\'';

				next();
			}
		}

		if (!testSchedule.testInstanceStartDate &&
			!testSchedule.testInstanceExecFreqInSeconds &&
			!testSchedule.testInstanceExecFreqInSeconds) {
			agenda.now(
				'executeTestSync',
				{ testSchedule, authorizationHeader })
				.then(function onJobCreated (result) {
					emitter.once(result.attrs._id + '_error', (res) => {
						logger.info(res);
						scheduleTestResponse.message = res.message;
						scheduleTestResponse.status = res.statusCode;
						next();
					});

					emitter.once(result.attrs._id + '_ok', (res) => {
						logger.info(res);
						scheduleTestResponse.message = res;
						scheduleTestResponse.status = 200;
						next();
					});
				})
				.catch(function onError (err) {
					logger.error(err);

					if (!Object.keys(scheduleTestResponse).includes('message')) {
						scheduleTestResponse.message = 'Unknown error.';
					}

					if (!Object.keys(scheduleTestResponse).includes('status')) {
						scheduleTestResponse.status = 500;
					}
				});
		}
	}, (req, res) => {
		res.type('json');
		res.status(scheduleTestResponse.status).send(scheduleTestResponse);
		logger.debug('Sent response with status %d and body %s', scheduleTestResponse.status, scheduleTestResponse.message);
	});

	// Cancel
	app.use('/' + app.get('base-path') + 'cancel-test', (req, res, next) => {
		// validate the request parameters
		if (req.body === null) {
			cancelTestResponse.status = 400;
			cancelTestResponse.message = 'Request data is invalid.';

			next();
			return;
		}

		let requestBody = req.body;

		if (!requestBody.jobId) {
			cancelTestResponse.status = 400;
			cancelTestResponse.message = 'jobId is required.';

			next();
			return;
		}

		if (!utils.isValidObjectId(requestBody.jobId)) {
			cancelTestResponse.status = 400;
			cancelTestResponse.message = 'jobId must be a valid ObjectId.';

			next();
			return;
		}

		if (!requestBody.executorId) {
			cancelTestResponse.status = 400;
			cancelTestResponse.message = 'executorId is required.';

			next();
			return;
		}

		if (!utils.isValidObjectId(requestBody.executorId)) {
			cancelTestResponse.status = 400;
			cancelTestResponse.message = 'executorId must be a valid ObjectId.';

			next();
			return;
		}

		const jobId = new ObjectId(requestBody.jobId);
		const executorId = new ObjectId(requestBody.executorId);

		agenda.cancel({ _id: jobId, 'data.testSchedule._executorId': executorId })
			.then(function onJobRemoved (numJobsRemoved) {
				logger.info('Number of jobs removed: %s', numJobsRemoved);

				cancelTestResponse.status = 200;
				cancelTestResponse.message = nodeUtil.format('Successfully removed job with Id %s', jobId);

				if (numJobsRemoved === 0) {
					cancelTestResponse.status = 500;
					cancelTestResponse.message =
						nodeUtil.format('Unable to find job with Id %s, belonging to user with Id %s.', jobId, executorId);
				}

				next();
			})
			.catch(function onError (error) {
				logger.error(error.toString());

				cancelTestResponse.status = 500;
				cancelTestResponse.message = 'Unable to cancel the job due to an unexpected error.';

				next();
			});
	}, (req, res) => {
		res.type('json');
		res.status(cancelTestResponse.status).send(cancelTestResponse);
		logger.debug('Sent response with status %d and body %s', cancelTestResponse.status, cancelTestResponse.message);
	});
};

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
const utils = require('../../lib/otf-util');
const ObjectId = require('mongoose').Types.ObjectId;

class TestSchedule {
	constructor (testInstanceId, testInstanceStartDate, testInstanceExecFreqInSeconds, testInstanceEndDate,
	             async, asyncTopic, asyncMode, executorId) {
		this.testInstanceId = testInstanceId;
		this.testInstanceStartDate = testInstanceStartDate;
		this.testInstanceExecFreqInSeconds = testInstanceExecFreqInSeconds;
		this.testInstanceEndDate = testInstanceEndDate;
		this.async = async;
		this.asyncTopic = asyncTopic;
		this.asyncMode = asyncMode;
		this.executorId = executorId;
	}

	get testInstanceId () {
		return this._testInstanceId;
	}

	set testInstanceId (value) {
		if (!value) {
			throw 'testInstanceId is required.';
		}

		if (!utils.isValidObjectId(value)) {
			throw 'testInstanceId must be a valid ObjectId';
		}

		this._testInstanceId = new ObjectId(value);
	}

	get testInstanceStartDate () {
		return this._testInstanceStartDate;
	}

	set testInstanceStartDate (value) {
		// Accepts type Date, and the "now" keyword recognized by human interval (integrated with Agenda)
		if (value !== 'now') {
			let parsedDate = Date.parse(value);

			if (isNaN((parsedDate))) {
				throw 'testInstanceStartDate must be a valid date, or must be ' / 'now' / '.';
			}
		}

		this._testInstanceStartDate = value;
	}

	get testInstanceExecFreqInSeconds () {
		return this._testInstanceExecFreqInSeconds;
	}

	set testInstanceExecFreqInSeconds (value) {
		if (value) {
			if (typeof value !== 'number') {
				throw 'testInstanceExecFreqInSeconds must be a number.';
			}

			if (value < 30) {
				throw 'testInstanceExecFreqInSeconds must be greater than or equal to 30.';
			}
		}

		this._testInstanceExecFreqInSeconds = value;
	}

	get testInstanceEndDate () {
		return this._testInstanceEndDate;
	}

	set testInstanceEndDate (value) {
		// Allow a null end date
		if (value) {
			let parsedDate = Date.parse(value);

			if (isNaN((parsedDate))) {
				throw 'testInstanceEndDate must be a valid date.';
			}
		}

		this._testInstanceEndDate = value;
	}

	get async () {
		return this._async;
	}

	set async (value) {
		this._async = value;
	}

	get asyncTopic () {
		return this._asynTopic;
	}

	set asyncTopic (value) {
		this._asynTopic = value;
	}

	get asyncMode () {
		return this._asyncMode;
	}

	set asyncMode (value) {
		this._asyncMode = value;
	}

	get executorId () {
		return this._executorId;
	}

	set executorId (value) {
		if (!value) {
			throw 'executorId is required.';
		}

		if (!utils.isValidObjectId(value)) {
			throw 'executorId must be a valid ObjectId.';
		}

		this._executorId = new ObjectId(value);
	}

	print () {
		logger.debug(
			'testInstanceId: ' + this._testInstanceId + '\n' +
			'testInstanceStartDate: ' + this._testInstanceStartDate + '\n' +
			'testInstanceExecFreqInSeconds: ' + this._testInstanceExecFreqInSeconds + '\n' +
			'testInstanceStartDate: ' + this._testInstanceStartDate + '\n' +
			'async: ' + this._async + '\n' +
			'asnycTopic: ' + this._asyncTopic + '\n' +
			'executorId: ' + this._executorId);
	}
}

module.exports = TestSchedule;

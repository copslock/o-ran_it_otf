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


module.exports = function (app) {
	const mongooseClient = app.get('mongooseClient');
	const { Schema } = mongooseClient;

	const jobs = new Schema({
		name: { type: String },
		data: { type: new Schema({
			testSchedule: {
				testInstanceId: { type: Schema.Types.ObjectId },
				testInstanceStartDate: { type: String },
				async: { type: Boolean },
				asyncTopic: { type: String },
				testInstanceExecFreqInSeconds: { type: Number },
				testInstanceEndDate: { type: String },
				executorId: { type: Schema.Types.ObjectId }
			},
			authorizationHeader: { type: String }
		}) },
		type: { type: String },
		nextRunAt: { type: String },
		lastModifiedBy: { type: String },
		lockedAt: { type: String },
		lastRunAt: { type: String }
	}, {
		shardKey: { 'data.testSchedule._testInstanceId': 1 },
		timestamps: true
	});

	return mongooseClient.model('jobs', jobs, 'agenda');
};

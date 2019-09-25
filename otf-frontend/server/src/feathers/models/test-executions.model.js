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
	const testExecutions = new Schema({
		processInstanceId: { type: String, required: true },
		businessKey: { type: String },
		testResult: { type: String },
		testDetails: { type: Object },
		startTime: { type: Date },
		endTime: { type: Date },
		async: { type: Boolean },
		asyncTopic: { type: String },
		groupId: { type: Schema.Types.ObjectId, ref: 'groups', required: true },
		executorId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		testResultMessage: { type: String },
		testHeadResults: [
			new Schema({
				testHeadName: { type: String },
				testHeadId: { type: Schema.Types.ObjectId, ref: 'testHeads' },
				testHeadGroupId: { type: Schema.Types.ObjectId, ref: 'groups' }
			}, {_id: false})
		],
		testInstanceResults: [{}],
		historicEmail: { type: String },
		historicTestInstance: { type: Object },
		historicTestDefinition: { type: Object }

	}, {
			timestamps: false
		});
	
	testExecutions.index({startTime: 1, endTime: 1});

	return mongooseClient.model('testExecutions', testExecutions, 'testExecutions');
};

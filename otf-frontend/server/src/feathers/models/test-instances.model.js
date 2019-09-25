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
	const uniqueTIByTD = new Schema({
		testInstanceName: { type: String, required: true },
		testDefinitionId: { type: Schema.Types.ObjectId, ref: 'testDefinitions', required: true }
	});
	uniqueTIByTD.index({
		testInstanceName: 1,
		testDefinitionId: 1,
	}, {
			unique: true,
		});

	const testInstances = new Schema({

		testInstanceDescription: { type: String },
		testInstanceName: { type: String, required: true },
		testDefinitionId: { type: Schema.Types.ObjectId, ref: 'testDefinitions', required: true },
		useLatestTestDefinition: { type: Boolean, required: true },
		processDefinitionId: { type: String, default: '' },
		testData: { type: Object, default: {} },
		internalTestData: { type: Object, default: {} },
		simulationMode: { type: Boolean, default: false },
		simulationVthInput: { type: Object, default: {} },
		vthInput: { type: Object, default: {} },
		pfloInput: { type: Object, default: {} },
		disabled: { type: Boolean, default: false },
		maxExecutionTimeInMillis: { type: Number, default: 0 },

		groupId: { type: Schema.Types.ObjectId, ref: 'groups', required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: 'users' },
		createdBy: { type: Schema.Types.ObjectId, ref: 'users' }
	}, {
			timestamps: true,
			minimize: false
		});
	testInstances.index({
		testInstanceName: 1,
		testDefinitionId: 1,
	}, {
			unique: true,
		});

	testInstances.post('save', function (error, doc, next) {
		if (error.name === 'MongoError' && error.code === 11000) {
			next(new Error('Test Instance name must be unique per Test Definition'));
		} else {
			next();
		}
	});

	return mongooseClient.model('testInstances', testInstances, 'testInstances');
};
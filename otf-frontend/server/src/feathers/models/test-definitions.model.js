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
	const testDefinitions = new Schema({
		testName: { type: String, required: true },
		testDescription: { type: String, required: true },
		processDefinitionKey: { type: String, unique: true },
		creatorId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		groupId: { type: Schema.Types.ObjectId, ref: 'groups', required: true },
		bpmnInstances: [new Schema({
			processDefinitionId: { type: String },
			deploymentId: { type: String },
			version: { type: String, required: true },
			bpmnFileId: { type: Schema.Types.ObjectId, ref: 'files', required: true },
			resourceFileId: {type: Schema.Types.ObjectId, ref: 'files' },
			isDeployed: { type: Boolean, required: true, default: false },
			testHeads: [new Schema({
				testHeadId: { type: Schema.Types.ObjectId, ref: 'testHeads' },
				bpmnVthTaskId: { type: String },
				label: { type: String, default: '' }
			}, { _id: false })],
			pflos: [new Schema({
				bpmnPfloTaskId: { type: String },
				label: { type: String, default: '' }
			}, { _id: false })],
			testDataTemplate: { type: Object, default: {} }, 
			updatedBy: { type: Schema.Types.ObjectId, ref: 'users'},
			createdBy: { type: Schema.Types.ObjectId, ref: 'users'}
		}, { _id: false, timestamps: true })],
		disabled: {type: Boolean, default: false},
		updatedBy: { type: Schema.Types.ObjectId, ref: 'users'},
		createdBy: { type: Schema.Types.ObjectId, ref: 'users'}
	}, {
	timestamps: true,
	minimize: false
	});

	
	
	return mongooseClient.model('testDefinitions', testDefinitions, 'testDefinitions');
};

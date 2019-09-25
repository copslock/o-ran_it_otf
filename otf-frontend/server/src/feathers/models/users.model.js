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
	const users = new Schema({
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		permissions: { type: Array, default: ['user'] },
		enabled: { type: Boolean, required: true, default: false },
		isVerified: { type: Boolean },
		verifyToken: { type: String },
		verifyExpires: { type: Date },
		verifyChanges: { type: Object },
		resetToken: { type: String },
		resetExpires: { type: Date },
		defaultGroup: { type: Schema.Types.ObjectId, ref: 'groups' },
		defaultGroupEnabled: { type: Boolean, default: false },
		password: { type: String, required: true },
		favorites: new Schema({
			testDefinitions: [{type: Schema.Types.ObjectId, ref: 'testDefinitions'}]
		}, { _id: false})
	}, {
		timestamps: true
	});

	return mongooseClient.model('users', users);

};

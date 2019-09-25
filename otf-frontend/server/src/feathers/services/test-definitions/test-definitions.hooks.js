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


const { authenticate } = require('@feathersjs/authentication').hooks;
const {permissions, limitFields } = require('../../hooks/permissions/permissions.js');
const convertToYAML = require('../../hooks/convertToYAML.js');
const convertJY = require('../../hooks/convertToYAMLRecursive');
const deleteVersion = require('../../hooks/delete-version.js');
const deleteDefinition = require('../../hooks/delete-definition.js');

module.exports = {
	before: {
		all: [authenticate('jwt'), permissions('testDefinitions')],
		find: [],
		get: [],
		create: [
			function (context) {
				context.data.creatorId = context.params.user._id;
				return context;
			},
			convertJY('json')
		],
		update: [convertJY('json')],
		patch: [deleteVersion(), convertJY('json')],
		remove: [
			deleteDefinition()
		]
	},

	after: {
		all: [],
		find: [convertToYAML()],
		get: [convertToYAML()],
		create: [convertToYAML()],
		update: [convertToYAML()],
		patch: [convertToYAML()],
		remove: []
	},

	error: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: []
	}
};

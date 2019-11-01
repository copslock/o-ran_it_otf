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


// Application hooks that run for every service
const log = require('./hooks/log');
const paginateOption = require('./hooks/paginate-option');
const createdBy = require('./hooks/createdBy');
const updatedBy = require('./hooks/updatedBy');
const {iff, disallow, isProvider, skipRemainingHooks} = require('feathers-hooks-common');
const { ObjectID } = require('mongodb');
const shardKey = require('./hooks/insertShardKey.js');

module.exports = {
	before: {
		all: [shardKey(), paginateOption(), skipRemainingHooks(context => !context.params.provider)],
		find: [
			function(context){
				const {query} = context.params;

				iterate(query, '');

				return context;
			}
		],
		get: [],
		create: [createdBy()],
		update: [updatedBy()],
		patch: [updatedBy()],
		remove: []
	},

	after: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: []
	},

	error: {
		all: [log()],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: []
	}
};

function iterate(obj, stack) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object") {

				//check for $in
				if(/\._id$/.test(property) && obj[property]['$in'] && obj[property]['$in'].length && obj[property]['$in'].length > 0){
					obj[property]['$in'].forEach((elem, val) => {
						obj[property]['$in'][val] = new ObjectID(elem);
					})
				}else{
					iterate(obj[property], stack + '.' + property);
				}
			} else if(/\._id$/.test(property)){
				obj[property] = new ObjectID(obj[property]);
			}
		}
	}
}

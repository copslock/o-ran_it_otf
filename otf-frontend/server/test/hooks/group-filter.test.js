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


const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const groupFilter = require('../../src/hooks/group-filter');

describe('\'groupFilter\' hook', () => {
	let app;

	beforeEach(() => {
		app = feathers();

		app.use('/dummy', {
			async get (id) {
				return { id };
			}
		});

		app.service('dummy').hooks({});
	});

	it('runs the hook', async () => {
		const result = await app.service('dummy').get('test');

		assert.deepEqual(result, { id: 'test' });
	});
});

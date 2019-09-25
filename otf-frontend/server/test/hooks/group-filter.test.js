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

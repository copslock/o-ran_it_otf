const assert = require('assert');
const app = require('../../src/app');

describe('\'testHeads\' service', () => {
	it('registered the service', () => {
		const service = app.service('test-heads');

		assert.ok(service, 'Registered the service');
	});
});

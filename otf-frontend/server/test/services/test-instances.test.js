const assert = require('assert');
const app = require('../../src/app');

describe('\'testInstances\' service', () => {
	it('registered the service', () => {
		const service = app.service('test-instances');

		assert.ok(service, 'Registered the service');
	});
});

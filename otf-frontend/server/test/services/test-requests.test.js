const assert = require('assert');
const app = require('../../src/app');

describe('\'testRequests\' service', () => {
	it('registered the service', () => {
		const service = app.service('test-requests');

		assert.ok(service, 'Registered the service');
	});
});

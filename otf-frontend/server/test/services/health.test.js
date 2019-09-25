const assert = require('assert');
const app = require('../../src/app');

describe('\'health\' service', () => {
	it('registered the service', () => {
		const service = app.service('health');

		assert.ok(service, 'Registered the service');
	});
});

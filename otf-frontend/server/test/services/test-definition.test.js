const assert = require('assert');
const app = require('../../src/app');

describe('\'testDefinition\' service', () => {
	it('registered the service', () => {
		const service = app.service('test-definition');

		assert.ok(service, 'Registered the service');
	});
});

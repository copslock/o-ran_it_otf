const assert = require('assert');
const app = require('../../src/app');

describe('\'tests\' service', () => {
	it('registered the service', () => {
		const service = app.service('tests');

		assert.ok(service, 'Registered the service');
	});
});

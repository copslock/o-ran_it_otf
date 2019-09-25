const assert = require('assert');
const app = require('../../src/app');

describe('\'strategyUpload\' service', () => {
	it('registered the service', () => {
		const service = app.service('strategy-upload');

		assert.ok(service, 'Registered the service');
	});
});

const assert = require('assert');
const app = require('../../src/app');

describe('\'groupsM\' service', () => {
	it('registered the service', () => {
		const service = app.service('groups-m');

		assert.ok(service, 'Registered the service');
	});
});

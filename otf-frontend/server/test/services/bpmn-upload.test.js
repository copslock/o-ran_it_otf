const assert = require('assert');
const app = require('../../src/app');

describe('\'bpmnUpload\' service', () => {
	it('registered the service', () => {
		const service = app.service('bpmn-upload');

		assert.ok(service, 'Registered the service');
	});
});

/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


const assert = require('assert');
const rp = require('request-promise');
const url = require('url');
const app = require('../src/app');

const port = app.get('port') || 3030;
const getUrl = pathname => url.format({
	hostname: app.get('host') || 'localhost',
	protocol: 'http',
	port,
	pathname
});

describe('Feathers application tests', () => {
	before(function (done) {
		this.server = app.listen(port);
		this.server.once('listening', () => done());
	});

	after(function (done) {
		this.server.close(done);
	});

	it('starts and shows the index page', () => {
		return rp(getUrl()).then(body =>
			assert.ok(body.indexOf('<html>') !== -1)
		);
	});

	describe('404', function () {
		it('shows a 404 HTML page', () => {
			return rp({
				url: getUrl('path/to/nowhere'),
				headers: {
					'Accept': 'text/html'
				}
			}).catch(res => {
				assert.strictEqual(res.statusCode, 404);
				assert.ok(res.error.indexOf('<html>') !== -1);
			});
		});

		it('shows a 404 JSON error without stack trace', () => {
			return rp({
				url: getUrl('path/to/nowhere'),
				json: true
			}).catch(res => {
				assert.strictEqual(res.statusCode, 404);
				assert.strictEqual(res.error.code, 404);
				assert.strictEqual(res.error.message, 'Page not found');
				assert.strictEqual(res.error.name, 'NotFound');
			});
		});
	});
});

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


// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
const logger = require('../../lib/logger');
const util = require('util');

// To see more detailed messages, uncomment the following line:
// logger.level = 'debug';

module.exports = function () {
	return context => {
		// This debugs the service call and a stringified version of the hook context
		// You can customize the message (and logger) to your needs
		logger.debug(`${context.type} app.service('${context.path}').${context.method}()`);

		if (typeof context.toJSON === 'function' && logger.level === 'debug') {
			logger.debug('Hook Context', util.inspect(context, { colors: false }));
		}

		if (context.error) {
			logger.error(context.error.stack);
		}
	};
};

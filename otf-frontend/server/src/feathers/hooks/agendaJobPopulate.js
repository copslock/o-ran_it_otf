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


module.exports = function () {
	return async context => {
		if (context.result.data && context.result.limit >= 0 ) {
			for (let i = 0; i < context.result.data.length; i++) {
				await context.app.services[context.app.get('base-path') + 'test-instances']
					.get(context.result.data[i].data.testSchedule._testInstanceId, context.params)
					.then(result => {
						context.result.data[i].testInstanceName = result.testInstanceName;
					})
					.catch(err => {
						console.log(err);
					});
			}
		} else if(context.result.limit) {
			await context.app.services[context.app.get('base-path') + 'test-instances']
				.get(context.result.data.data.testSchedule._testInstanceId, context.params)
				.then(result => {
					context.result.data.testInstanceName = result.testInstanceName;
				})
				.catch(err => {
					console.log(err);
				});
		}else if (context.result.length) {
			for (let i = 0; i < context.result.length; i++) {
				await context.app.services[context.app.get('base-path') + 'test-instances']
					.get(context.result[i].data.testSchedule._testInstanceId, context.params)
					.then(result => {
						context.result[i].testInstanceName = result.testInstanceName;
					})
					.catch(err => {
						console.log(err);
					});
			}
		} else if(context.result.data) {
			await context.app.services[context.app.get('base-path') + 'test-instances']
				.get(context.result.data.testSchedule._testInstanceId, context.params)
				.then(result => {
					context.result.testInstanceName = result.testInstanceName;
				})
				.catch(err => {
					console.log(err);
				});
		}
		return context;
	};
};

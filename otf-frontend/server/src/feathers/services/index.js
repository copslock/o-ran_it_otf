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


const users = require('./users/users.service.js');
const groups = require('./groups/groups.service.js');
const testHeads = require('./test-heads/test-heads.service.js');
const testInstances = require('./test-instances/test-instances.service.js');
const testExecutions = require('./test-executions/test-executions.service.js');
const testDefinitions = require('./test-definitions/test-definitions.service.js');
const jobs = require('./jobs/jobs.service.js');
const health = require('./health/health.service.js');
const bpmnUpload = require('./bpmn-upload/bpmn-upload.service.js');
const bpmnValidate = require('./bpmn-validate/bpmn-validate.service.js');
const testExecutionStatus = require('./test-execution-status/test-execution-status.service.js');
const testExecutionController = require('../../agenda/controllers/test-execution-controller');
const mailer = require('./mailer/mailer.service.js');
const authManagement = require('./auth-management/auth-management.service.js');
const feedback = require('./feedback/feedback.service.js');
const fileTransfer = require('./file-transfer/file-transfer.service.js');
const files = require('./files/files.service.js');
const execute = require('./execute/execute.service.js');
const messages = require('./messages/messages.service')

module.exports = function (app) {
	app.configure(users);
	app.configure(files);
	app.configure(fileTransfer)
	app.configure(groups);
	app.configure(testHeads);
	app.configure(testInstances);
	app.configure(testExecutions);
	app.configure(testDefinitions);
	app.configure(execute);
	app.configure(messages);
	app.configure(jobs);
	app.configure(health);
	app.configure(bpmnUpload);
	app.configure(bpmnValidate);
	app.configure(testExecutionStatus);
	app.configure(testExecutionController);
	app.configure(mailer);
	app.configure(authManagement);
	app.configure(feedback);
};

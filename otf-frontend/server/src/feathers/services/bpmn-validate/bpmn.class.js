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


const { parseString, Builder } = require('xml2js');
const logger = require('../../../lib/logger');
const Response = require('http-response-object');

class Bpmn {
    constructor(app, data, params){
		this.delegates = [
			{
				name: 'vth',
				regex: new RegExp('^(vth)(:([a-zA-Z0-9_ -]+))(:([a-zA-Z0-9_ -]+))?$', 'i'),
				delegate: '${callTestHeadDelegate}'
			},
			{
				name: 'lvth',
				regex: new RegExp('^(lvth)(:([a-zA-Z0-9_ -]+))(:([a-zA-Z0-9_ -]+))?$', 'i'),
				topic: 'vth'
			},
			{
				name: 'log',
				regex: new RegExp('^UTIL:LogTestResult$', 'i'),
				delegate: '${logTestResultDelegate}',
			},
			{
				name: 'pflo',
				regex: new RegExp('^PFLO(:(.+))?$', 'i'),
				delegate: '${runTestInstanceDelegate}',
				topic: 'testInstance'
			},
			{
				name: 'SubFlow',
				regex: new RegExp('^SUBFLOW(:(.+))?$', 'i'),
				delegate: '${runTestInstanceDelegate}',
				topic: 'testInstance'
			},
			{
				name: 'dmaap',
				regex: new RegExp('^PostResultsToDMaaP(:(.+))?$', 'i'),
				delegate: '${postResultsToDMaaPDelegate}'
			},
			{
				name: 'mail',
				regex: new RegExp('^UTIL:SendMail(:(.+))?$', 'i'),
				delegate: '${sendMailDelegate}'
			}
		];

		this.serviceTasksNotAllowed = [
			{
				key: 'camunda:class'
			}
		]
        
        this.params = params;
        this.data = data;
        this.app = app;
		this.parsedXMLtoJSON = null;
		this.bpmnVthTaskIds = [];
		this.bpmnPfloTaskIds = [];
		this.processDefinitionKey = null;
		this.errors = {};
		this.hasLog = false; //1 log is required in each workflow
		this.hasTestHeads = false;
		
    }

    async validate(){
		//convert bpmn to json
		//console.log(this.data.testDefinition);
		parseString(
			this.data.testDefinition.bpmnInstances[this.data.testDefinition.currentVersion].bpmnXml,
			(err, result) => {
				if (err) {
					logger.error(err);
				}
				this.parsedXMLtoJSON = Object.assign({}, result);
            }
		);

        //If the bpmn was unable to be parsed, return error response
        if (!this.parsedXMLtoJSON) {
			return new Response(500, {}, { errors: { parsingError: { error: 'Failed to parse bpmn. Try Again.' } } });
        }

        //set temp process
		var process = this.parsedXMLtoJSON['bpmn:definitions']['bpmn:process'][0];


		// Not needed with new modeler
        //If a process definition key was sent with the requrest, use it instead
		if (this.data.testDefinition.processDefinitionKey && this.data.testDefinition.processDefinitionKey != '') {
			this.processDefinitionKey = this.data.testDefinition.processDefinitionKey;
		}else{
		    this.processDefinitionKey = process.$.id;
        }
        
        //Check to see if the process definition key is unique
        let key = await this.app.services[this.app.get('base-path') + 'bpmn-validate'].get(this.processDefinitionKey, this.params).then();
        if(key.statusCode != 200 && key.errors && key.errors.processDefinitionKey){
            this.errors.processDefinitionKey = {
                error: 'Process Definition Key has already been used',
                key: this.processDefinitionKey
            };
        }
        
        // Verify start task(s) are async. Only start task(s) in main process
		if (process['bpmn:startEvent']) {
			for (var j = 0; j < process['bpmn:startEvent'].length; j++) {
				var startEvent = process['bpmn:startEvent'][j];
				if (startEvent.$['camunda:asyncBefore'] != 'true') {
					this.errors.startEvent = { error: 'Start Event, ' + startEvent.$.id + ', is not async' };
				}
			}
		} else {
			this.errors.startEvent = { error: 'Workflow must have a start even' };
        }
        
        //Find all of the task boxes that need to be changed (recursive)
        await this.findTasks(this.parsedXMLtoJSON['bpmn:definitions']['bpmn:process'][0]);
        
        // If log task did not exist, log
		if (!this.hasLog) {
			this.errors.required = { error: 'No LogSetResult task. One is required.' };
        }
        
        // If errors, return them before creating an instance in the database
		if (
			this.errors.processDefinitionKey ||
			this.errors.notFound ||
			this.errors.testHead ||
			this.errors.permissions ||
			this.errors.required ||
			this.errors.startEvent
		) {
			return new Response(400, {}, { bpmnVthTaskIds: this.bpmnVthTaskIds, errors: this.errors });
		}

        //set the new process Definition key
        //console.log('END Process Key: ' + this.processDefinitionKey);
		this.parsedXMLtoJSON['bpmn:definitions']['bpmn:process'][0].$.id = this.processDefinitionKey;

        //build xml from the json object
		var xmlBuilder = new Builder();
        var xmlToSend = xmlBuilder.buildObject(this.parsedXMLtoJSON);
        
		//console.log(this.bpmnVthTaskIds);
		
		let response = { 
			bpmnXml: xmlToSend, 
			bpmnVthTaskIds: this.bpmnVthTaskIds, 
			bpmnPfloTaskIds: this.bpmnPfloTaskIds, 
			processDefinitionKey: this.processDefinitionKey, 
		};

		//if there are errors
		if(JSON.stringify(this.errors) != "{}"){
			response.errors = this.errors
		}

		return new Response(200, {}, response);
        
    }

    async findTasks (process) {
		//If there are service tasks in the diagram
		if(process['bpmn:serviceTask']){
			//console.log('has service task');
			// Go through all of the service task boxes
			for (let j = 0; j < process['bpmn:serviceTask'].length; j++) {
				//console.log(process['bpmn:serviceTask'][j])

				//check that the service task is not on the DO NOT ALLOW list
				for(let n = 0; n < this.serviceTasksNotAllowed.length; n++){
					//check cammunda keys
					if(process['bpmn:serviceTask'][j].$[this.serviceTasksNotAllowed[n].key]){
						if(!this.errors.permissions){
							this.errors.permissions = [];
						}
						this.errors.permissions.push({error: this.serviceTasksNotAllowed[n].key + ' is not allowed.'})
					}
				}

				//Clear any user defined delegate expressions
				if(process['bpmn:serviceTask'][j].$['camunda:delegateExpression']){
					process['bpmn:serviceTask'][j].$['camunda:delegateExpression'] = '';
				}
				
				//Go through all the delegates that are defined by OTF (in constructor)
				for (let d = 0; d < this.delegates.length; d++){
					var match = null;
					
					if(match = process['bpmn:serviceTask'][j].$.name.match(this.delegates[d].regex)){
						//console.log(match)
						switch(this.delegates[d].name){
							case 'vth':
							case 'cvth':
							case 'lvth':
								await this.checkTestHead(match, process['bpmn:serviceTask'][j]);
								break;

							case 'pflo':
								let temp = {bpmnPfloTaskId: process['bpmn:serviceTask'][j].$.id};
								if(match[2]){
									temp['label'] = match[2];
								}
								this.bpmnPfloTaskIds.push(temp);
								break;
							
							case 'log':
								this.hasLog = true;
								break;
							
						}

						if(this.delegates[d].topic){
							process['bpmn:serviceTask'][j].$['camunda:type'] = 'external';
							process['bpmn:serviceTask'][j].$['camunda:topic'] = this.delegates[d].topic;
						}else{
							process['bpmn:serviceTask'][j].$['camunda:delegateExpression'] = this.delegates[d].delegate;
						}

						break;

					}
				}

			}
		} //end if service task

		if(process['bpmn:task']){
			//console.log('has task')
			//init service task array 
			if(!process['bpmn:serviceTask']){
				process['bpmn:serviceTask'] = [];
			}

			// Go through all of the task boxes
			for (let j = 0; j < process['bpmn:task'].length; j++) {
				//console.log(process['bpmn:task'][j])

				for (let d = 0; d < this.delegates.length; d++){
					var match = null;
					
					if(match = process['bpmn:task'][j].$.name.match(this.delegates[d].regex)){
						//console.log(match)
						switch(this.delegates[d].name){
							case 'vth':
							case 'cvth':
							case 'lvth':
								await this.checkTestHead(match, process['bpmn:task'][j]);
								break;
							
							case 'pflo':
								let temp = {bpmnPfloTaskId: process['bpmn:task'][j].$.id};
								if(match[2]){
									temp['label'] = match[2];
								}
								this.bpmnPfloTaskIds.push(temp);
								break;
							
							case 'log':
								this.hasLog = true;
								break;
							
						}

						let task = {
							$: {
								id: process['bpmn:task'][j].$.id,
								name: process['bpmn:task'][j].$.name,
							},
							'bpmn:incoming': process['bpmn:task'][j]['bpmn:incoming'],
							'bpmn:outgoing': process['bpmn:task'][j]['bpmn:outgoing']
						}

						if(this.delegates[d].topic){
							task.$['camunda:type'] = 'external';
							task.$['camunda:topic'] = this.delegates[d].topic;
						}else{
							task.$['camunda:delegateExpression'] = this.delegates[d].delegate;
						}

						process['bpmn:serviceTask'].push(task);

						process['bpmn:task'].splice(j, 1);
						j--;

						break;

					}
				}

			}

		}

		//If subprocess, find tasks
		if(process['bpmn:subProcess']){
			for(let p = 0; p < process['bpmn:subProcess'].length; p++){
				await this.findTasks(process['bpmn:subProcess'][p]);
			}
		}
		
	}

	async checkTestHead(match, task){
		if (match.length >= 4) {
			match[3] = '^' + match[3] + '$';
			this.params.query = { testHeadName: new RegExp(match[3], 'i')};
			delete this.params.paginate;
			//console.log(this.params);
			await this.app.services[this.app.get('base-path') + 'test-heads'].find(this.params)
				.then(result => {
					if (result.total > 1) {
						// there should only be one test head found, else there is an error in the database
						if (!this.errors.testHeads) {
							this.errors.testHeads = [];
						}
						this.errors.testHeads.push({ error: result.total + ' test heads named: ' + match[3] });
					}

					if (result.total == 0) {
						if(!this.errors.permissions){
							this.errors.permissions = []
						}
						this.errors.permissions.push({ error: 'You do not have access to test head: ' + match[3] });
					} else {
						this.bpmnVthTaskIds.push({ testHead: result.data[0], bpmnVthTaskId: task.$.id });
					}
				})
				.catch(err => {
					//console.log(err);
					this.errors.notFound = { error: 'Test head "' + match[3] + '" does not exist' };
				});
		} else if (match.length > 0) { // no test head name supplied

		}
	}

}
module.exports = function (app, data, params) {
	return new Bpmn(app, data, params);
};

module.exports.Bpmn = Bpmn;
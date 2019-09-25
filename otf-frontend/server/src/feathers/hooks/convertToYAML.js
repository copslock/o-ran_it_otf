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


const YAML = require('yamljs');

module.exports = function () {
	function isEmpty(obj) {
		for(var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}

	return async context => {
		
		if (context.result.length) {
			for (let i = 0; i < context.result.length; i++) {
				if (context.result[i].testData) {
					if(isEmpty(context.result[i].testData)){
						context.result[i].testDataJSON = {};
						context.result[i].testData = '';
					}else if(typeof context.result[i].testDate != typeof ''){
						context.result[i].testDataJSON = context.result[i].testData;
						context.result[i].testData = YAML.stringify(context.result[i].testData);
					}	
				}
				if (context.result[i].testConfig) {
					if(isEmpty(context.result[i].testConfig)){	
						context.result[i].testConfig = '';
					}else{
						context.result[i].testConfig = YAML.stringify(context.result[i].testConfig);
					}	
				}
				if(context.result[i].vthInputTemplate){
					if(isEmpty(context.result[i].vthInputTemplate)){
						context.result[i].vthInputTemplate = '';
					}else{
						if(typeof '' !== typeof context.result[i].vthInputTemplate){
							context.result[i].vthInputTemplateJSON = context.result[i].vthInputTemplate;
							context.result[i].vthInputTemplate = YAML.stringify(context.result[i].vthInputTemplate);
						}
					}
				}
				if (context.result[i].vthInput) {
					context.result[i].vthInputYaml = '';
					if(isEmpty(context.result[i].vthInput)){
						context.result[i].vthInput = {};
					}else{
						context.result[i].vthInputYaml = {};
						for(key in context.result[i].vthInput){
							
							context.result[i].vthInputYaml[key] = YAML.stringify(context.result[i].vthInput[key]);
						}
					}
					
				}
				if (context.result[i].bpmnInstances) {
					
					//console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
					// if(context.re)
					// 	if(isEmpty(context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplate)){
					// 		context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplate = '';
					// 	}else{
					// 		context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplateJSON = context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplate;
					// 		context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplate = YAML.stringify(context.result[i].bpmnInstances[0].testHeads[0].testHeadId.vthInputTemplate);
					// 	}
					
				
					for(let k = 0; k < context.result[i].bpmnInstances.length; k++){
						
						if( context.result[i].bpmnInstances[k].testHeads){
							for(let h = 0; h <  context.result[i].bpmnInstances[k].testHeads.length; h++){
								//let head = key.testHeads[h];
								//console.log("___________________________________________________________");
								//console.log(context.result[i].bpmnInstances[k].testHeads[h].testHeadId);
								if(typeof '' != typeof context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate){
									if(isEmpty(context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate)){
										context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplateJSON = {};
										context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate = '';
									}else if(context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate){
										context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplateJSON = context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate;
										context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate = YAML.stringify(context.result[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate);
									}
								}
							}
						}
						if(isEmpty(context.result[i].bpmnInstances[k].testDataTemplate)){	
							context.result[i].bpmnInstances[k].testDataTemplate = '';
							context.result[i].bpmnInstances[k].testDataTemplateJSON = {};
						}else if(typeof context.result[i].bpmnInstances[k].testDataTemplate !== typeof ''){
							context.result[i].bpmnInstances[k].testDataTemplateJSON = context.result[i].bpmnInstances[k].testDataTemplate;
							context.result[i].bpmnInstances[k].testDataTemplate = YAML.stringify(context.result[i].bpmnInstances[k].testDataTemplate);
						}	
						//context.result[i].bpmnInstances[k] = key;
					}
					
				}
			}
		} else if (context.result.total > 1) {
			for (let i = 0; i < context.result.data.length; i++) {
				if (context.result.data[i].testData) {
					if(isEmpty(context.result.data[i].testData)){
						context.result.data[i].testData = '';
						context.result.data[i].testDataJSON = {};
					}else if(typeof context.result.data[i].testDate != typeof ''){
						context.result.data[i].testDataJSON = context.result.data[i].testData;
						context.result.data[i].testData = YAML.stringify(context.result.data[i].testData);
					}
					
				}
				if (context.result.data[i].vthInput) {
					context.result.data[i].vthInputYaml = '';
					if(isEmpty(context.result.data[i].vthInput)){
						context.result.data[i].vthInput = {};
					}else{
						context.result.data[i].vthInputYaml = {};
						for(key in context.result.data[i].vthInput){
							
							context.result.data[i].vthInputYaml[key] = YAML.stringify(context.result.data[i].vthInput[key]);
						}
					}
					
				}
				if (context.result.data[i].testConfig) {
					if(isEmpty(context.result.data[i].testConfig)){
						context.result.data[i].testConfig = '';
					}else{
						context.result.data[i].testConfig = YAML.stringify(context.result.data[i].testConfig);
					}
				}
				if (context.result.data[i].testDataTemplate) {
					if(isEmpty(context.result.data[i].testDataTemplate)){
						context.result.data[i].testDataTemplate = '';
						context.result.data[i].testDataTemplateJSON = {};
					}else{
						context.result.data[i].testDataTemplateJSON = context.result.data[i].testDataTemplate;
						context.result.data[i].testDataTemplate = YAML.stringify(context.result.data[i].testDataTemplate);
					}
				}
				if(context.result.data[i].bpmnInstances){
					for(let k in context.result.data[i].bpmnInstances){
						let key = context.result.data[i].bpmnInstances[k];
						if(key.testHeads){
							for(let h in key.testHeads){
								let head = key.testHeads[h];
								
								if(typeof '' != typeof context.result.data[i].bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate){	
									if(isEmpty(head.testHeadId.vthInputTemplate)){
										head.testHeadId.vthInputTemplate = '';
										head.testHeadId.vthInputTemplateJSON = {};
									}else if(head.testHeadId.vthInputTemplate){
										head.testHeadId.vthInputTemplateJSON = head.testHeadId.vthInputTemplate;
										head.testHeadId.vthInputTemplate = YAML.stringify(head.testHeadId.vthInputTemplate);
									}
								}
								key.testHeads[h] = head;
							}
						}
						if(isEmpty(key.testDataTemplate)){	
							key.testDataTemplate = '';
							key.testDataTemplateJSON = {};
						}else if(typeof key.testDataTemplate !== typeof ''){
							key.testDataTemplateJSON = key.testDataTemplate;
							key.testDataTemplate = YAML.stringify(key.testDataTemplate);
						}
						context.result.data[i].bpmnInstances[k] = key;	
					}
				}
			}
		} else if (context.result.data) {
			if (context.result.data.testData) {
				if(isEmpty(context.result.data.testData)){
					context.result.data.testData = '';
					context.result.data.testDataJSON = {};
				}else if(typeof context.result.data.testDate != typeof ''){
					context.result.data.testDataJSON = context.result.data.testData;
					context.result.data.testData = YAML.stringify(context.result.data.testData);
				}	
			}
			if (context.result.data.testConfig) {
				if(isEmpty(context.result.data.testConfig)){
					context.result.data.testConfig = '';
				}else{
					context.result.data.testConfig = YAML.stringify(context.result.data.testConfig);
				}	
			}
			if (context.result.data.vthInput) {
				context.result.data.vthInputYaml = '';
				if(isEmpty(context.result.data.vthInput)){
					context.result.data.vthInput = {};
				}else{
					context.result.data.vthInputYaml = {};
					for(key in context.result.data.vthInput){
						context.result.data.vthInputYaml[key] = YAML.stringify(context.result.data.vthInput[key]);
					}
				}
				
			}
			if (context.result.data.testDataTemplate) {
				if(isEmpty(context.result.data.testDataTemplate)){
					context.result.data.testDataTemplate = '';
					context.result.data.testDataTemplateJSON = {};
				}else{
					context.result.data.testDataTemplateJSON = context.result.data.testDataTemplate;
					context.result.data.testDataTemplate = YAML.stringify(context.result.data.testDataTemplate);
				}		
			}
			if (context.result.data.bpmnInstances){
				for(let k in context.result.data.bpmnInstances){
					let key = context.result.data.bpmnInstances[k];
					if(key.testHeads){
						for(let h in key.testHeads){
							let head = key.testHeads[h];
							//console.log(head.testHeadId);
							if(typeof '' != typeof context.result.data.bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate){
								if(isEmpty(head.testHeadId.vthInputTemplate)){
									head.testHeadId.vthInputTemplate = '';
									head.testHeadId.vthInputTemplateJSON = {};
								}else if(head.testHeadId.vthInputTemplate){
									head.testHeadId.vthInputTemplateJSON = head.testHeadId.vthInputTemplate;
									head.testHeadId.vthInputTemplate = YAML.stringify(head.testHeadId.vthInputTemplate);
								}
							}
							key.testHeads[h] = head;
						}
					}
					if(isEmpty(key.testDataTemplate)){	
						key.testDataTemplate = '';
						key.testDataTemplateJSON = {};
					}else if(typeof key.testDataTemplate !== typeof ''){
						key.testDataTemplateJSON = key.testDataTemplate;
						key.testDataTemplate = YAML.stringify(key.testDataTemplate);
					}
					context.result.data.bpmnInstances[k] = key;	
				}
			}
		} else {
			if (context.result.testData) {
				
				if(isEmpty(context.result.testData)){
					context.result.testData = '';
					context.result.testDataJSON = {};
				}else if(typeof context.result.testData != typeof ''){
					context.result.testDataJSON = context.result.testData;
					context.result.testData = YAML.stringify(context.result.testData);
				}else if(typeof context.result.testData == typeof ''){
					context.result.testDataJSON = YAML.parse(context.result.testData);
				}
				
			}
			if (context.result.testConfig) {
				if(isEmpty(context.result.testConfig)){
					context.result.testConfig = '';
				}else{
					context.result.testConfig = YAML.stringify(context.result.testConfig);
				}
			}
			if (context.result.vthInput) {
				context.result.vthInputYaml = '';
				if(isEmpty(context.result.vthInput)){
					context.result.vthInput = {};
				}else{
					context.result.vthInputYaml = {};
					for(key in context.result.vthInput){
						context.result.vthInputYaml[key] = YAML.stringify(context.result.vthInput[key]);
					}
				}
				
			}
			if (context.result.testDataTemplate) {
				if(isEmpty(context.result.testDataTemplate)){
					context.result.testDataTemplate = '';
					context.result.testDataTemplateJSON = {};
				}else{
					context.result.testDataTemplateJSON = context.result.testDataTemplate;
					context.result.testDataTemplate = YAML.stringify(context.result.testDataTemplate);
				}
			}
			if(context.result.vthInputTemplate){
				if(isEmpty(context.result.vthInputTemplate)){
					context.result.vthInputTemplate = '';
					context.result.vthInputTemplateJSON = {};
				}else{
					context.result.vthInputTemplateJSON = context.result.vthInputTemplate;
					context.result.vthInputTemplate = YAML.stringify(context.result.vthInputTemplate);
				}
			}
			if(context.result.bpmnInstances){
				for(let k in context.result.bpmnInstances){
					let key = context.result.bpmnInstances[k];
					if(key.testHeads){
						for(let h in key.testHeads){
							let head = key.testHeads[h];
							//console.log(head.testHeadId);
							if(typeof '' != typeof context.result.bpmnInstances[k].testHeads[h].testHeadId.vthInputTemplate){
								if(isEmpty(head.testHeadId.vthInputTemplate)){
									head.testHeadId.vthInputTemplate = '';
									head.testHeadId.vthInputTemplateJSON = {};
								}else if(head.testHeadId.vthInputTemplate){
									head.testHeadId.vthInputTemplateJSON = head.testHeadId.vthInputTemplate;
									head.testHeadId.vthInputTemplate = YAML.stringify(head.testHeadId.vthInputTemplate);
								}
							}
							key.testHeads[h] = head;
						}
					}
					if(isEmpty(key.testDataTemplate)){	
						key.testDataTemplate = '';
						key.testDataTemplateJSON = {};
					}else if(typeof key.testDataTemplate !== typeof ''){
						key.testDataTemplateJSON = key.testDataTemplate;
						key.testDataTemplate = YAML.stringify(key.testDataTemplate);
					}	
					context.result.bpmnInstances[k] = key;
				}
			}
		
		}
		return context;
	};
};

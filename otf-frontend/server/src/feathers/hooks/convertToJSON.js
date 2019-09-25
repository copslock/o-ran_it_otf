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
    function convertTabs(str){
        return str.replace(/\t/g, '    ');
    }
	return async context => {
		
		if (context.data.length) {
			for (var i = 0; i < context.data.length; i++) {
				if (context.data[i].testData && typeof '' === typeof context.data[i].testData) {
                    context.data[i].testData = convertTabs(context.data[i].testData);
					context.data[i].testData = YAML.parse(context.data[i].testData);
				}
				if (context.data[i].testConfig) {
                    context.data[i].testConfig = convertTabs(context.data[i].testConfig);
					context.data[i].testConfig = YAML.parse(context.data[i].testConfig);
				}
				if (context.data[i].testConfigTemplate) {
                    context.data[i].testConfigTemplate = convertTabs(context.data[i].testConfigTemplate);
					context.data[i].testConfigTemplate = YAML.parse(context.data[i].testConfigTemplate);
				}
				if (context.data[i].vthInputTemplate && typeof '' === typeof context.data[i].vthInputTemplate) {
					context.data[i].vthInputTemplate = convertTabs(context.data[i].vthInputTemplate);
					context.data[i].vthInputTemplate = YAML.parse(context.data[i].vthInputTemplate);
				}

                //Set empty string as empty json
                if (context.data[i].testData == ''){
                    context.data[i].testData = {};
                }
                if (context.data[i].testConfig == ''){
                    context.data[i].testConfig = {};
                }
				if (context.data[i].testConfigTemplate == '') {
                    context.data[i].testConfigTemplate = {};
				}
				if(context.data[i].bpmnInstances){
					for(let k in context.data[i].bpmnInstances){
						let key = context.data[i].bpmnInstances[k];
						if(key.testHeads){
							for(let h in key.testHeads){
								let head = key.testHeads[h];
								if(head.testHeadId.vthInputTemplate == ''){
									head.testHeadId.vthInputTemplate = {};
								}else if(head.testHeadId.vthInputTemplate && typeof '' === typeof head.testHeadId.vthInputTemplate){
									head.testHeadId.vthInputTemplate = YAML.parse(head.testHeadId.vthInputTemplate);
								}
							}
						}
						if(key.testDataTemplate == ''){	
							key.testDataTemplate = {};
						}else if(typeof '' === typeof key.testDataTemplate){
							key.testDataTemplate = YAML.parse(key.testDataTemplate);
						}	
					}
				}
			}
		} else {
			if (context.data.testData && typeof '' === typeof context.data.testData) {
                context.data.testData = convertTabs(context.data.testData);
				context.data.testData = YAML.parse(context.data.testData);
			}
			if (context.data.testConfig) {
                context.data.testConfig = convertTabs(context.data.testConfig);
				context.data.testConfig = YAML.parse(context.data.testConfig);
			}
			if (context.data.testConfigTemplate) {
                context.data.testConfigTemplate = convertTabs(context.data.testConfigTemplate);
				context.data.testConfigTemplate = YAML.parse(context.data.testConfigTemplate);
			}
			if (context.data.vthInputTemplate && typeof '' === typeof context.data.vthInputTemplate) {
                context.data.vthInputTemplate = convertTabs(context.data.vthInputTemplate);
				context.data.vthInputTemplate = YAML.parse(context.data.vthInputTemplate);
			}
			if (context.data.vthInput){
				for(let k in context.data.vthInput){
					if(typeof context.data.vthInput[k] === typeof ''){
						context.data.vthInput[k] = YAML.parse(context.data.vthInput[k]);
						if(context.data.vthInput[k] === null)
							context.data.vthInput[k] = {};
					}
				}
			}
			if(context.data.bpmnInstances){
				for(let k in context.data.bpmnInstances){
					let key = context.data.bpmnInstances[k];
					if(key.testHeads){
						for(let h in key.testHeads){
							let head = key.testHeads[h];
							if(head.testHeadId.vthInputTemplate == ''){
								head.testHeadId.vthInputTemplate = {};
							}else if(head.testHeadId.vthInputTemplate && typeof '' === typeof head.testHeadId.vthInputTemplate){
								head.testHeadId.vthInputTemplate = YAML.parse(head.testHeadId.vthInputTemplate);
							}
						}
					}
					if(key.testDataTemplate == ''){	
						key.testDataTemplate = {};
					}else  if(typeof '' === typeof key.testDataTemplate){
						key.testDataTemplate = YAML.parse(key.testDataTemplate);
					}	
				}
			}
			//Set empty string as empty json
            if (context.data.testData == ''){
                context.data.testData = {};
            }
            if (context.data.testConfig == ''){
                context.data.testConfig = {};
            }
            if (context.data.testConfigTemplate == '') {
                context.data.testConfigTemplate = {};
			}
			if (context.data.vthInputTemplate == '') {
				context.data.vthInputTemplate = {};
			}
		}
		// for(var j = 0; j < context.data.length; j++){
		//     for(var i = 0; i < context.data[j].testData.length; i++){
		// 	    context.data[j].testData[i].testData = YAML.parse(context.data[j].testData[i].testData);
		//     }
		// }
		return context;
	};
};

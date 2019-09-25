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

module.exports = function (convertTo) {

	const toConvert = ['testDataTemplate'];

	function convert(p) {
		for (var key in p) {
			if (p.hasOwnProperty(key) && (typeof p[key] === 'object' || typeof p[key] === 'array') ) {
				if (toConvert.indexOf(key) < 0) {
					convert(p[key])
				} else {
					
					if(convertTo == 'yaml'){
						p[key] = YAML.stringify(p[key]);
					}
					if(convertTo == 'json'){
						console.log(key)
						console.log(p[key]);
						p[key] = convertTabs(p[key]);
						p[key] = YAML.parse(p[key]);
						console.log(p[key]);
					}
				}
			}else{
				if (toConvert.indexOf(key) >= 0) {
						
					if(convertTo == 'yaml'){
						p[key] = YAML.stringify(p[key]);
					}
					if(convertTo == 'json'){
						p[key] = convertTabs(p[key]);
						p[key] = YAML.parse(p[key]);
						console.log(p[key])
					}
				}
			}
		}
	}

	function convertTabs(str){
		if(typeof str === 'string'){
			return str.replace(/\t/g, '    ');
		}
    }

	return async context => {
		if(context.result)
			convert(context.result);
		if(context.data)
			convert(context.data);
		return context;
	};
};

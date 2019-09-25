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


module.exports = function (context) {
	return async context => {
        function hasDeployedBpmn(){
            return context.app.services[context.app.get('base-path') + 'test-definitions']
                    .get(context.data.testDefinitionId, context.params)
                    .then(result => {
                        
                        if(!result.bpmnInstances){
                            return false;
                        }
                       
                        for(let i = 0; i < result.bpmnInstances.length; i++){
                            if(result.bpmnInstances[i].isDeployed){
                                return true;
                            }
                        }
                        return false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
           
        }
        
        if(context.data.processDefinitionId === '' && !context.data.useLatestTestDefinition){
            return false;
        }
        if(!hasDeployedBpmn()){
            return false;
        }
        if(hasDeployedBpmn() && (context.data.useLatestTestDefinition || context.data.processDefinitionId !== '') ){
            return true;
        }
    }
}
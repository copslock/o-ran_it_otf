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
            return await context.app.services[context.app.get('base-path') + 'test-instances']
                .get(context.data.testInstanceId, context.params)
                .then( result => {
                    if(result.disabled === true){
                        return true;
                        //throw new Error('Test Instance is locked and cannot be run!');
                    }else{
                        return context.app.services[context.app.get('base-path') + 'test-definitions']
                            .get(result.testDefinitionId, context.params)
                            .then(results => {
                                if(results.disabled === true){
                                    return true;
                                    
                                    //throw new Error('Test Definition is locked! The instance can not be run!');
                                }else{
                                    return false;
                                }
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }
                    
                })
                .catch(err => {
                    console.log(err);
                });
                
            }
}
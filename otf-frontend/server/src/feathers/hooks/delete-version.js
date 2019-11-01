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


const util = require('../../lib/otf-util');
const request = require('request');
const error = require('@feathersjs/errors');
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {

        //Get test-definition to compare
        let original = null;
        await context.app.services[context.app.get('base-path') + 'test-definitions'].get(context.id, context.params).then(result => {
            original = result;
        });

        //If there is a bpmn instance that is deployed and is no longer there, delete with service api
        if (context.data.bpmnInstances && original) {
            original.bpmnInstances.forEach(async (elem, val) => {
                let found = false;
                context.data.bpmnInstances.forEach((e, v) => {
                    if (elem.version == e.version) {
                        found = true;
                    }
                });
                if (!found && elem.isDeployed) {
                    let options = {
                        url: context.app.get('serviceApi').url + 'testStrategy/delete/v1/deploymentId/' + elem.deploymentId,
                        headers: {
                            'Authorization': 'Basic ' + util.base64Encode(context.app.get('serviceApi').aafId + ':' + context.app.get('serviceApi').aafPassword)
                        },
                        rejectUnauthorized: false,
                    }
                    
                    await new Promise((resolve, reject) => {
                        request.delete(options, (err, res, body) => {
                            if(err){
                                reject(err);
                            }
                            if(res && res.statusCode == 200){
                                resolve(res);
                            }else{
                                reject(res);
                            }
                        });
                    }).then(result => {
                        if(result.statusCode != 200){
                            context.error = new error(result.statusCode);
                            return Promise.reject(context.error);
                        }
                    }).catch(err => {
                        throw new errors.GeneralError(err.body.message);
                    });
                }
            });
        }
    };
};

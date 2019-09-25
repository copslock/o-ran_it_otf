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
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        let options = {
            url: context.app.get('serviceApi').url + 'testStrategy/delete/v1/testDefinitionId/' + context.id,
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
                    resolve(body);
                }else{
                    reject(res);
                }
            });
        }).then(result => {
            
        }).catch(err => {
            console.log(err);
        });
    };
};

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


module.exports = function (service) { 
    return async context => {
        // If the method is find, get, or create, return
        if(context.method == 'find' || context.method == 'get' || context.method == 'create'){
            return context;
        }

        // If the id or service does not exist, return
        if(!context.id || !context.service){
            return context;
        }

        let serviceString;
        if(service){
            serviceString = context.app.get('base-path') + service;
        }else{
            serviceString = context.path;
        }

        if(!context.app.services[serviceString].Model){
            return context;
        }

        // If the entity data hasnt been set, get and set it
        if(!context.params.entityData){
            context.params.entityData = await context.app.services[serviceString].get(context.id, { provider: undefined});
        }

        // Find the shard key from the model
        let shardKeys = {};
        Object.keys(context.app.services[serviceString].Model.schema.options.shardKey).forEach(key => {
            shardKeys[key] = context.params.entityData[key];
        })

        // Add the shard keys to the query
        Object.assign(context.params.query, shardKeys);

        return context;

    }
}
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


module.exports = function(userObject, groups, defaultPermissions = []){
    return getPermissions(userObject, groups, defaultPermissions);
}

function getPermissions(userObject, groups, defaultPermissions = []){
    if(!groups || !groups.length){
        return [];
    }

    let results = [];

    for(let i = 0; i < groups.length; i++){

        //Get user's roles in group
        let userInfo = groups[i].members.find((e) => {
            return e.userId.toString() == userObject._id.toString();
        });

        //grab permissions
        //add default that was passed in
        let perms = JSON.parse(JSON.stringify(defaultPermissions));

        if(userInfo){
            groups[i].roles.forEach((elem, val) => {
                if(userInfo.roles.includes(elem.roleName)){
                    elem.permissions.forEach(elem => {
                        perms.push(elem);
                    })
                }
            });
        }

        addGroupPermissions(results, groups[i], perms);

        //Run recusivley for parent and child groups
        if(groups[i].parentGroups){
            groups[i].parentGroups.forEach((e, v) => {
                addGroupPermissions(results, e, ['read'])
            });
        }
        if(groups[i].childGroups){
            groups[i].childGroups.forEach((e,v) => {
                addGroupPermissions(results, e, perms);
            });
        }

    }

    return results;
}

function addGroupPermissions(results, group, permissions){

    // Look for group in result to make sure it doesnt alreay exist
    let groupIndex = null;
    results.forEach((elem, val) => {
        if(elem._id.toString() == group._id.toString()){
            groupIndex = val;
            return;
        }
    })

    //If group doesn't exist add it to the array.
    if(groupIndex == null){
        groupIndex = results.push(group) - 1;
    }

    //add permissions to group 
    if(results[groupIndex].permissions){
        permissions = permissions.concat(results[groupIndex].permissions);
    }

    permissions = new Set(permissions);

    //set permissions
    results[groupIndex].permissions = Array.from(permissions);
}
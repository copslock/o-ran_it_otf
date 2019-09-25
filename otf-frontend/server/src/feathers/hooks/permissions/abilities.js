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


const { AbilityBuilder, Ability } = require('@casl/ability');
const config = require('../../../../config/default.json');

Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('write', ['create', 'update', 'patch']);
Ability.addAlias('delete', ['remove']);
Ability.addAlias('execute', ['create', 'remove']);
module.exports.defineAbilitiesFor = function (user, groups) {
    const { rules, can, cannot } = AbilityBuilder.extract();
    
    // If user is a site wide admin, they get all access
    if(user.permissions.includes('admin')){
        can('execute', 'all');
        can('management', 'all');
        can('crud', 'all');
        can('patch', 'all');
        return new Ability(rules);
    }

    //Permissions associated to roles within groups
	groups.forEach((elem, val) => {

        if(elem.permissions.includes('management')){
            can('management', 'groups', {_id: elem._id});
            can('write', 'groups', ['groupDescription', 'members', 'mechanizedIds', 'roles', 'updatedAt', 'updatedBy'], { _id: elem._id });
            can('write', 'groups', ['ownerId'], { _id: elem._id, ownerId: user._id});

            //remove management from the array of permissions
            elem.permissions.splice(elem.permissions.indexOf('management'), 1);
        }

        //Executing Test Instances
        if(elem.permissions.includes('execute')){
            can('execute', 'execute');
            can('execute', 'testInstances', { groupId: elem._id });
            can('create', 'jobs');
            can('remove', 'jobs');
            
            //remove execute permission from the array of permissions
            elem.permissions.splice(elem.permissions.indexOf('execute'), 1);
        }

        //Test Heads can be accessed by members of the group
        can(elem.permissions, 'testHeads', { groupId: elem._id });

		//Test Definitions can be accessed by members of the group
        can(elem.permissions, 'testDefinitions', { groupId: elem._id });

		//Test Instances can be accessed by members of the group
        can(elem.permissions, 'testInstances', { groupId: elem._id });

        //Test Executions can be accessed by members of the group
        can('read', 'testExecutions', { groupId: elem._id });
        can('read', 'testExecutions', ["_id", "groupId", "testHeadResults.testHeadId", "testHeadResults.testHeadName", "testHeadResults.testHeadGroupId", "testHeadResults.startTime", "testHeadResults.endTime"], {"testHeadResults.testHeadGroupId": elem._id});

    });

    /*************************************
    *   TEST HEADS access
    */

    //-- READ
    // Users can read all public test heads
    can('read', 'testHeads', { isPublic: true });

    // Users should never be able to read the credential 
    cannot('read', 'testHeads', ['authorizationCredential']);

    //-- EXECUTE
    // Users can execute all public test heads
    can('execute', 'testHeads', { isPublic: true });

    /*************************************
    *   USERS access
    */

    //-- READ

    // Users should be able to view all users' basic information, and can read more information if it is their user object
    can('read', 'users', ['_id', 'firstName', 'lastName', 'email']);
    can('read', 'users', ['permissions', 'favorites', 'defaultGroup', 'defaultGroupEnabled'], { _id: user._id });

    //-- WRITE

    // Users should be able to only edit specific fields from their user object
    can('write', 'users', ['password', 'favorites', 'defaultGroup', 'defaultGroupEnabled', 'updatedBy', 'updatedAt'], { _id: user._id })

    

    //Authentication
    can(['create', 'remove'], 'authentication');
    
    return new Ability(rules);
}   
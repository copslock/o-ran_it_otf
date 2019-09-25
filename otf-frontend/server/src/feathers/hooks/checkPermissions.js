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
		let group = {};
		if(context.data.parentGroupId){
			//get the groups from the group service
			//check if the user is an Admin in the parent group 
			await context.app.services[context.app.get('base-path') + 'groups']
			.get(context.data.parentGroupId, context.params)
			.then( result => {	
				group = result;
			});
			
			if(group.members){
				for(let i = 0; i < group.members.length; i++){
					if(group.members[i].userId.toString() === context.params.user._id.toString()){
						if(!group.members[i].roles.includes("admin")){
							throw new Error('Can not create child group. You must be an admin of the parent group.');
						}
					}
				}
			}else{
				throw new Error('Can not create child group. You must be an admin of the parent group.');
			}
		}
	}
}
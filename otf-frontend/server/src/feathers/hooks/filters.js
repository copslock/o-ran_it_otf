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


// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { iff, disallow } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');
const { ObjectID } = require('mongodb');
//const getEntity = async (context) => await new Promise((resolve, reject) => context.app.services[context.path].get(context.id || context.data._id, context.params).then(r => {resolve(r)}).catch(e => {reject(e)}));

module.exports.groupFilter = function (options = null) {
	return async context => {

		if (!context.params.provider) {
			return Promise.resolve(context);
		}
		
		switch(context.method){
			case 'get':
				context.params.query._id = new ObjectID(context.id);

				let result = await context.app.services[context.app.get('base-path') + 'groups'].find(context.params);
				if(result.data && result.data.length > 0){
					context.result = result.data[0];
				}else if(result.length > 0){
					context.result = result[0];
				}else{
					context.result = [];
				}
				break;
			case 'find':
				if(typeof context.params.user._id === 'string'){
					context.params.user._id = new ObjectID(context.params.user._id);
				}

				if(!context.params.user.permissions.includes('admin')){
					context.params.query['members.userId'] = context.params.user._id;
				}

				let lookup = context.params.query.lookup;
				delete context.params.query.lookup;

				// If graphLookup is supplied in the query params as true, lookup all parents and children
				if(lookup == 'up' || lookup == 'both'){
					context.result = await new Promise((resolve, reject) => {
						context.app.services[context.app.get('base-path') + 'groups'].Model.aggregate([
							{
								$match: context.params.query
							}
						]).then(async res => {
							if(res.length){
								for(let i = 0; i < res.length; i++){
									res[i]['parentGroups'] = await getParentGroups(context.app.services[context.app.get('base-path') + 'groups'].Model, res[i]);
								}
							}
							resolve(res);
						}).catch(err => {
							throw new errors.GeneralError(err);
						})
					});
				}
				
				//if user is an admin in one of ther groups, find children groups
				if(lookup == 'down' || lookup == 'both'){
					//this will be set if lookup already occured
					if(context.result){
						for(let i = 0; i < context.result.length; i++){
							//only find children if they are admins
							if(checkGroupForPermission(context.result[i], context.params.user, 'management')){
								let children = await getChildGroups(context.app.services[context.app.get('base-path') + 'groups'].Model, context.result[i]);
								context.result[i]['childGroups'] = children;
							}
						}
					}else{
						context.result = await new Promise(async (resolve, reject) => {
							context.app.services[context.app.get('base-path') + 'groups'].find(context.params).then(async res => {
								let results;
								if(res.total){
									results = res.data;
								}else{
									results = res;
								}
								for(let i = 0; i < results.length; i++){
									if(checkGroupForPermission(results[i], context.params.user, 'management')){
										results[i]['childGroups'] = await getChildGroups(context.app.services[context.app.get('base-path') + 'groups'].Model, results[i]);
									}
								}
								resolve(results);
							}).catch(err => {
								throw new errors.GeneralError(err);
							})
						});
					}
				}

				break;

			case 'create':
				break;

			case 'update':
			case 'patch':
			case 'remove':
				break;

			default:
				break;


		}

		return context;
	};
};

getParentGroups = async function(model, group){
	return new Promise(async (resolve, reject) => {
		let parentGroups = [];
		if(group.parentGroupId){
			model.aggregate([
				{
					$match: {
						'_id': group.parentGroupId
					}
				}
			]).then(async res => {
				if(res[0] && res[0].parentGroupId){
					parentGroups.unshift(res[0]);
					let parents = await getParentGroups(model, res[0]);
					parents.forEach(e => {
						parentGroups.unshift(e);
					});
				}
				resolve(parentGroups);
			}).catch(err => {
				reject(err);
			})
		}else{
			resolve();
		}
	});
	
}

getChildGroups = async function(model, group){
	return new Promise(async (resolve, reject) => {
		let childGroups = [];
		model.aggregate([
			{
				$match: {
					'parentGroupId': group._id
				}
			}
		]).then(async res => {
			if(res.length > 0){
				for(let i = 0; i < res.length; i++){
					childGroups.push(res[i]);
					let childern = await getChildGroups(model, res[i]);
					childern.forEach((elem, val) => {
						childGroups.push(elem);
					});
				}
			}
			resolve(childGroups);
		}).catch(err => {
			reject(err);
		})

	})
}

checkGroupForPermission = function(group, user, permission){
	let result = false;
	group.members.forEach((member, val) => {
		if(member.userId.toString() == user._id.toString()){
			group.roles.forEach((e,v) => {
				if(e.permissions.includes(permission)){
					if(member.roles.includes(e.roleName)){
						result = true;
						return;
					}
				}
			});
			return;
		}
	})
	return result;
}

module.exports.afterGroups = function(){
	return async context => {

	}
}

module.exports.userFilter = function (){
	return async context => {
		
		if(context.params.query){
			context.params.query._id = context.params.user._id;
		}
		if(context.id && context.id != context.params.user._id){
			throw new errors.Forbidden();
		}
		if(context.data){
			if(context.data._id && context.data._id != context.params.user._id){
				throw new errors.Forbidden();
			}
			//should not be able to edit their groups
			delete context.data.groups;
			//should not be able to edit their permissions
			delete context.data.permissions;
			
			delete context.data.createdAt;
			delete context.data.updatedAt;
			delete context.data.enabled;
		}
	}
}

module.exports.getGroupFilter = function (options = { key: 'groupId' }) {
	return async hook => {
		if(!hook.params.query){
			hook.params.query = {};
		}
		
		hook.params.query._id = hook.id;
		delete hook.id;
		
		return hook.service.find(hook.params)
			.then(result => {
				if (result.data) {
					hook.result = result.data[0];
				} else {
					hook.result = result;
				}
				return hook;
			});
	};
};

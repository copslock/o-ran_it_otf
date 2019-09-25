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


const { defineAbilitiesFor } = require('./abilities.js');
const { toMongoQuery } = require('@casl/mongoose')
const getPermissions = require('./get-permissions.js');
const { Forbidden } = require('@feathersjs/errors');
//const pick = require('lodash.pick');
var dot = require('dot-object');
const pick = require('object.pick');
const { ObjectID } = require('mongodb');

permissions = function (name = null) {
	return async context => {

		if (!context.params.provider) {
			return Promise.resolve(context);
		}

		const action = context.method;
		const service = name ? context.app.service(context.path) : context.service;
		const serviceName = name || context.path;

		let groupQueryParams = JSON.parse(JSON.stringify(context.params));
		groupQueryParams.query = {
			lookup: 'both'
		}

		//get groups list
		let groups = await context.app.services[context.app.get('base-path') + 'groups'].find(groupQueryParams);

		//organize permissions for the groups
		let groupsPermissions = getPermissions(context.params.user, groups);

		//Define Abilities for the user
		const ability = defineAbilitiesFor(context.params.user, groupsPermissions);

		//Define the fields that they have access to
		let allowedFields;
		if(service.Model){
			allowedFields = service.Model.accessibleFieldsBy(ability, context.method);
		}

		const throwUnlessCan = (action, resource, field = null) => {
			let instance = resource;
			if(service.Model && typeof resource === 'object'){
				instance = new service.Model(resource);
			}else{
				instance = serviceName;
			}
	
			if (ability.cannot(action, instance, field)) {
				let message = `You are not allowed to ${action} ${serviceName}`;

				if(field){
					message += ` on field ${field}`;
				}

				throw new Forbidden(message);
			}
		}

		context.params.ability = ability;


		if (context.method === 'create') {
			throwUnlessCan('create', context.data);
		}

		if (!context.id) {               

			throwUnlessCan(context.method, serviceName);
			
			const query = toMongoQuery(ability, serviceName, action);
			
			if (query !== null) {
				if(context.params.query.$or && query.$or){
					query.$and = [
						{$or: Object.assign([], context.params.query.$or)},
						{$or: Object.assign([], query.$or)}
					];
					delete context.params.query.$or;
					delete query.$or;
				}

				Object.assign(context.params.query, query);

			} else {
				context.params.query.$limit = 0;
			}

			if(context.params.query.$select){
				//context.params.query.$select = context.params.query.$select.filter(elem => allowedFields.includes(elem));
				context.params.query.$select = context.params.query.$select.filter(elem => {
					for(let i = 0; i < allowedFields.length; i++){
						
						//if there is dot notation, then it only looks at the parent variable name
						elem = elem.toString().match(new RegExp(/^(\w+)/))[0];

						if(allowedFields[i] == elem){
							return true;
						}

					};

					return false;
				});
				


			}else{
				context.params.query.$select = allowedFields;
			}

			if(context.params.query.$select && context.params.query.$select.length == 0){
				context.params.query.$select = allowedFields;
			}

			if(!context.params.query.$select){
				context.params.query.$select = [];
			}
			//groupId is used for permissions conditions and must be selected
			if(!context.params.query.$select.includes('groupId')){
				context.params.query.$select.push('groupId');
			}
			
			return context;
		}

		const params = Object.assign({}, context.params, { provider: null });

		const result = await service.get(context.id, params);
		throwUnlessCan(action, result);

		if (action === 'get') {
			context.result = pick(result, allowedFields);
		}else{
			if(context.data){
				Object.keys(context.data).forEach(key => {
					if(key == "$push"){
						Object.keys(context.data['$push']).forEach(k => {
							throwUnlessCan(action, result, k);
						});
					}else{
						throwUnlessCan(action, result, key);
					}
				})
			}
			//context.data = pick(context.data, allowedFields);
		}

		return context;

	}
}

makeObjectIdString = function(obj) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object"){
				if(ObjectID.isValid(obj[property])) {
					obj[property] = obj[property].toString()
				}else{
					makeObjectIdString(obj[property]);
				}
			}
		}
	}
}

myPick = function(elem, allowedFields){
	//when turning the object into dot notation, we loose the
	makeObjectIdString(elem);

	let d = dot.dot(elem);
	let toPick = [];
	Object.keys(d).forEach((key) => {
		allowedFields.forEach((f, i) => {
			let r = '^' + f;
			if(key.replace(/\.([0-9]+)\./g, '.').match(new RegExp(r))){
				toPick.push(key);
			}
		})
	});
	let picked = pick(d, toPick);
	let obj = dot.object(picked)
	return obj;
}

limitFields = function(){
	return async context => {
		if(context.result.data && context.result.data.length != undefined){
			//checkFields(context.params.ability, context.result.data, context.service.Model);
			context.result.data.forEach((elem, val) => {
				let instance = new context.service.Model(elem);
				const allowedFields = instance.accessibleFieldsBy(context.params.ability);
				//context.result.data[val] = pick(elem, allowedFields);
				context.result.data[val] = myPick(elem, allowedFields);
			});
		}else if(context.result && context.result.length != undefined){
			context.result.forEach((elem, val) => {
				let instance = new context.service.Model(elem);
				const allowedFields = instance.accessibleFieldsBy(context.params.ability);
				//context.result[val] = pick(elem, allowedFields);
				context.result[val] = myPick(elem, allowedFields);
			});
		}else if(context.result){
			//checkFields(context.params.ability, context.result, context.service.Model); 
			let instance = new context.service.Model(context.result);
			let allowedFields = instance.accessibleFieldsBy(context.params.ability);
			//context.result = pick(context.result, allowedFields);
			context.result = myPick(context.result, allowedFields);
		}
	}
}


module.exports = {
	permissions: permissions,
	limitFields: limitFields
}

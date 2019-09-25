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


const Response = require('http-response-object');
const Readable = require('stream').Readable;
const mongooseGridFS = require('mongoose-gridfs');
const AdmZip = require('adm-zip');
const errors = require('@feathersjs/errors');

class Service {
	constructor (options) {
		this.options = options || {};
		this.mongoose = this.options.app.get('mongooseClient');
		this.gridfs = mongooseGridFS({
			collection: 'fs',
			model: 'File',
			mongooseConnection: this.mongoose.connection
		});
		this.FileModel = this.gridfs.model;
	}

	async find (params) {
		return new Response(200, {});
	}

	async get (id, params) {
		let content = await this.callReadFile(id).then(res => {
			return res;
		});

		if(params.query && params.query.robot){
			content = await this.createRobotResponse(content);
		}
		return content;
	}

	async create (data, params) {
        const files = params.files;

        if (!files || files.length === 0) {
            throw new BadRequest("No files found to upload")
        }

        let promises = [];

        files.forEach(file => {
            let promise = new Promise( (resolve, reject) => {

                let stream = new Readable();
                stream.push(file.buffer);
                stream.push(null);

            	this.FileModel.write(
            		{
            			filename: file.originalname,
            			contentType: file.mimeType
            		},
            		stream,
            		function (error, savedAttachment) {
            			if (error) {
            				logger.error(error);
            				reject(error);
            			} else {
                            stream.destroy();
                            resolve(savedAttachment);
            			}
                    }
                );

            })

            promises.push(promise);
        });

        const result = await Promise.all(promises);
        
        return result;
	}

	async update (id, data, params) {
		return new Response(200, {});
	}

	async patch (id, data, params) {
		return new Response(200, {});
	}

	async remove (id, params) {
		let err = await this.callUnlinkFile(id).then(err => {
            return err;
        });

        if(err){
            throw errors.GeneralError(err);
        }        

        return new Response(200, {});
	}

	readFile (id) {
		return new Promise(resolve => {
			// FileModel.readById(context.id, (err, content) => resolve(content));
			let stream = this.FileModel.readById(id);
	
			stream.on('error', (err) => resolve(err));
			stream.on('data', (content) => resolve(content));
			stream.on('close', (res) => resolve(res));
			// api.on(event, response => resolve(response));
		});
	}
	
	async callReadFile (id) {
		return this.readFile(id);
	}
	
	async createRobotResponse(content){
	
		let re;
	
		await new Promise((resolve, reject) => {
			let newObj = {};
			let read = new Readable();
			read.push(content);
			read.push(null);
			let z = new AdmZip(content);
			let entries = z.getEntries();
			entries.forEach(zipEntry => {
				newObj[zipEntry.name] = zipEntry.getData().toString('utf8');
				// console.log(zipEntry.toString()); // outputs zip entries information
				// console.log(zipEntry.getData().toString('utf8')); 
			});
			resolve(newObj);
		}).then(res => {
			re = res;
			//console.log(re);
		}).catch(err => {
			console.log(err);
		});
	
		return re;
	}

	unlinkFile(id) {
	
		return new Promise(resolve => {
			
			//FileModel.readById(context.id, (err, content) => resolve(content));
			this.FileModel.unlinkById(id, (err) => resolve(err));
			//api.on(event, response => resolve(response));
		});
	}
	
	async callUnlinkFile(id) {
		return await this.unlinkFile(id);
	}
}



module.exports = function (options) {
	return new Service(options);
};

module.exports.Service = Service;

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
const { createModel } = require('mongoose-gridfs');
const AdmZip = require('adm-zip');
const errors = require('@feathersjs/errors');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const {
	Aborter,
	BlockBlobURL,
	BlobURL,
	downloadBlobToBuffer,
	uploadStreamToBlockBlob
  } = require("@azure/storage-blob");


class Service {
	constructor (options) {
		this.options = options || {};
		// this.File = createModel({
		// 	collection: 'fs',
		// 	model: 'File',
		// 	mongooseConnection: mongoose.connection
		// });
	}

	async find (params) {
		return new Response(200, {});
	}

	async get (id, params) {
		if(!id){
			throw new errors.BadRequest("File id is required");
		}

		// Get Blob url
		const blob = BlobURL.fromContainerURL(this.options.app.get('azureStorageContainerUrl'), id);
		const stats = await blob.getProperties().catch(err => {
			throw new errors.NotFound();
		});
		// const content = await blob.download(Aborter.none, 0);
		const buffer = Buffer.alloc(stats.contentLength);
		await downloadBlobToBuffer(
			Aborter.timeout(30 * 60 * 1000),
			buffer,
			blob,
			0,
			undefined,
			{
			  blockSize: 4 * 1024 * 1024, // 4MB block size
			  parallelism: 20, // 20 concurrency
			}
		  );

		return buffer;
	}

	async create (data, params) {
        const files = params.files;

        if (!files || files.length === 0) {
            throw new BadRequest("No files found to upload")
        }

		let promises = [];
		
        files.forEach(file => {
            let promise = new Promise(async (resolve, reject) => {

				let exists, filename, blob, blockBlob;
				// Creates the file id and checks that there isn't already a file with that name
				do {

					filename = ObjectID().toString();
					
					blob = BlobURL.fromContainerURL(this.options.app.get('azureStorageContainerUrl'), filename);
					blockBlob = BlockBlobURL.fromBlobURL(blob);
					exists = await blockBlob.getProperties().catch(err => {
						if(err.statusCode == 404){
							exists = false;
						}
					});

				} while (exists);
	
				blockBlob.upload(Aborter.none, file.buffer.toString(), file.size).then(
					result => {
						result._id = filename;
						resolve(result);
					}
				).catch(
					error => {
						reject(error);
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
		// let err = await this.callUnlinkFile(id).then(err => {
        //     return err;
        // });

        // if(err){
        //     throw errors.GeneralError(err);
        // }        

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

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


module.exports = function (app) {
	const mongooseClient = app.get('mongooseClient');
	const { Schema } = mongooseClient;
	const files = new Schema({//Esquema base de los usuarios.
        length: {
            type: Number
        },
        chunkSize: {
            type: Number
        },
        uploadDate: {
            type: Date
        },
        md5: {
            type: String
        },
        filename: {
            type: String
        },
        contentType: {
            type: String
        },
        metadata: {
            type: Object
        },
        path:{
            type:String,
            readonly:true
        }
    },{collection:`fs.files`, shardKey: { filename: 1 }});
	
	return mongooseClient.model('files', files);

};

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


import { BaseModel } from "./base-model.model";

export interface Group extends BaseModel{

    groupName: String;
    groupDescription: String;
    parentGroupId: String;
    ownerId: String;
    mechanizedIds: Array<String>;

}


export class Groups implements Group {
    groupName: String;
    groupDescription: String;
    parentGroupId: String;
    ownerId: String;
    mechanizedIds: String[];
    _id: String;
    createdAt: String;
    createdBy: String;
    updatedAt: String;
    updatedBy: String;

    static get modelName(){
        return 'groups';
    }

    constructor(group){
        this._id = group._id;
        this.groupName = group.groupName;
        this.parentGroupId = group.parentGroupId;
    }
}
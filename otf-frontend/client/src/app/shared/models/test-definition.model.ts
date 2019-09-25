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

export interface TestDefinition extends BaseModel {
    
    testName: String;
    testDescription: String;
    processDefinitionKey: String;
    groupId: String;

    bpmnInstances: Array<BpmnInstance>;

    disabled: Boolean;

}

export interface BpmnInstance {
    processDefinitionId: String;
    deploymentId: String;
    version: String;
    bpmnFileId: String;
    resourceFileId: String;
    isDeployed: Boolean;

    testHeads: Array<TestHeadRef>;
    pflos: Array<Pflow>;

    testDataTemplate: Object;

    updatedBy: String;
    createdBy: String;
    createdAt: String;
    updatedAt: String;
}

export interface TestHeadRef {
    testHeadId: String;
    bpmnVthTaskId: String;
    label: String;
}

export interface Pflow {
    bpmnPflowTaskId: String;
    label: String;
}
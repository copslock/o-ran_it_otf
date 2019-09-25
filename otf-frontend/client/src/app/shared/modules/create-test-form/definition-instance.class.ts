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


export class DefinitionInstance {

    public bpmnFileId: String;
    public bpmnXml: any;
    public resourceFileId: String;
    public resourceFileName: String;
    public isDeployed: Boolean;
    public testHeads: TestHead[];
    public dataTestHeads: DataTestHead[];
    public testDataTemplate: String;
    public testDataTemplateJSON: any;
    public version: String;
    public bpmnHasChanged: Boolean;
    public pflos: Pflo[];

    constructor(){
        this.testDataTemplate = '';
        this.version = '';
        this.testHeads = [];
        this.dataTestHeads = [];
        this.pflos = [];
        this.isDeployed = false;
        this.bpmnFileId = null;
        this.resourceFileName = null;
        this.bpmnXml = null;
        this.resourceFileId = null;
        this.bpmnHasChanged = false;
    }

}

interface TestHead {
    bpmnVthTaskId: String;
    testHeadId: String;
}

interface DataTestHead extends TestHead {
    testHead: any;
}

interface Pflo {
    bpmnPfloTaskId: String;
    label: String;
}
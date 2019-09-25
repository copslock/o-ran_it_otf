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


import { TestDefinition, BpmnInstance, TestHeadRef, Pflow } from "app/shared/models/test-definition.model";
import { toInteger } from "@ng-bootstrap/ng-bootstrap/util/util";

export class TestDefinitionElement implements TestDefinition  {

    testName: String;
    testDescription: String;
    processDefinitionKey: String;
    groupId: String;
    bpmnInstances: BpmnInstanceElement[];
    disabled: Boolean;
    _id: String;
    createdAt: String;
    createdBy: String;
    updatedAt: String;
    updatedBy: String;

    currentVersion; // int Array index of the bpmnInstances
    currentVersionName;
    currentInstance: BpmnInstanceElement;

    constructor(testDefinition?){
        if(testDefinition){
            this.setAll(testDefinition);
        }else{
            this.reset();
        }
    }


    reset(){
        this._id = "";
        this.testName = '';
        this.testDescription = '';
        this.groupId = '';
        this.processDefinitionKey = '';
        this.disabled = false;
        this.createdAt = null;
        this.createdBy = null;
        this.updatedAt = null;
        this.updatedBy = null;

        this.bpmnInstances = [];
        this.addBpmnInstance();

        this.switchVersion();
    }

    switchVersion(version?){
        if(version){
            //find the version
            this.bpmnInstances.forEach((elem, val) => {
                if(elem['version'] == version){
                    this.currentVersion = val;
                    this.currentInstance = this.bpmnInstances[val];
                    this.currentVersionName = this.currentInstance.version;
                }
            });
        }else{
            //get latest version
            this.currentVersion = this.bpmnInstances.length - 1;
            this.currentInstance = this.bpmnInstances[this.currentVersion];
            this.currentVersionName = this.currentInstance.version;
        }
    }

    //Setter Methods

    setAll(td){
        this._id = td._id;
        this.testName = td.testName;
        this.testDescription = td.testDescription;
        this.groupId = td.groupId;
        this.processDefinitionKey = td.processDefinitionKey;
        this.setBpmnInstances(td.bpmnInstances);
        this.switchVersion();
    }

    setId(id: String){
        this._id = id;
    }

    setName(testName: String){
        this.testName = testName;
    }

    setDescription(testDescription: String){
        this.testDescription = testDescription;
    }

    setGroupId(groupId: String){
        this.groupId = groupId;
    }

    setProcessDefinitionKey(processDefinitionKey: String){
        this.processDefinitionKey = processDefinitionKey;
    }

    setBpmnInstances(instances: BpmnInstanceElement[] = []){
        
        
        this.bpmnInstances = instances;
    }

    setNewVersion(newVersion: number = null){
        if(newVersion == null){
            newVersion = this.bpmnInstances.length;
        }
        if(this.setVersion(newVersion) == -1){
            this.setNewVersion(++newVersion);
        }
        return newVersion;
    }

    setVersion(version){
        this.bpmnInstances.forEach((elem, val) => {
            if(elem.version == version && this.currentVersion != val ){
                return -1;
            }
        });
        this.currentInstance.version = version;
        return version;
    }

    addBpmnInstance(instance?){
        if(!instance){
           instance = this.newInstance();
        }
        //console.log(this.bpmnInstances[this.bpmnInstances.length - 1].version )
        if(this.bpmnInstances[this.bpmnInstances.length - 1]){
            instance['version'] = (toInteger(this.bpmnInstances[this.bpmnInstances.length - 1].version) + 1).toString();
        }else{
            instance['version'] = "1";      
        }
        this.bpmnInstances.push(instance);
                
    }

    removeBpmnInstance(version){
        this.bpmnInstances.forEach((elem, val) =>{
            if(elem['version'] == version){
                this.bpmnInstances.splice(val, 1);
            }
        });
    }

    getBpmnInstances(version: String = null){
        if(!version)
            return this.bpmnInstances;
        
        this.bpmnInstances.forEach((elem, val) => {
            if(elem['version'] == version){
                return elem;
            }
        });
    }

    newInstance(): BpmnInstanceElement {
        return {} as BpmnInstanceElement;
    }





}

export class BpmnInstanceElement implements BpmnInstance {
    createdAt: String;
    updatedAt: String;
    processDefinitionId: String;    
    deploymentId: String;
    version: String;
    bpmnFileId: String;
    resourceFileId: String;
    isDeployed: Boolean;
    testHeads: TestHeadRef[];
    pflos: Pflow[];
    testDataTemplate: String;
    testDataTemplateJSON: any;
    updatedBy: String;
    createdBy: String;

    bpmnXml: String;
    bpmnHasChanged: Boolean;

}
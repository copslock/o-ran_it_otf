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


import { DefinitionInstance } from "./definition-instance.class";
import { element } from "@angular/core/src/render3/instructions";

export class TestDefinition {

    public _id: String;
    public testName: String;
    public testDescription: String;
    public groupId: String;
    public processDefinitionKey: String;

    public bpmnInstances: DefinitionInstance[];

    public currentVersion; // int Array index of the bpmnInstances
    public currentVersionName;
    public currentInstance: DefinitionInstance;

    constructor(testDefinition: TestDefinition = null){
        if(testDefinition){
            this.setAll(testDefinition);
        }
    }


    reset(){
        this._id = '';
        this.testName = '';
        this.testDescription = '';
        this.groupId = '';
        this.processDefinitionKey = '';
        this.bpmnInstances = [
            this.newInstance() as DefinitionInstance
        ];
        this.currentInstance = this.bpmnInstances[0];
        this.currentVersion = 0;
    }

    getAll(){
        return {
            _id: this._id,
            testName: this.testName,
            testDescription: this.testDescription,
            processDefinitionKey: this.processDefinitionKey,
            bpmnInstances: this.bpmnInstances,
            currentVersion: this.currentVersion
        };
    }

    switchVersion(version: String = null){
        
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

    getVersionKey(){
        return this.currentVersion;
    }

    //Setter Methods

    setAll(td){
        this._id = td._id;
        this.testName = td.testName;
        this.testDescription = td.testDescription;
        this.groupId = td.groupId;
        this.processDefinitionKey = td.processDefinitionKey;
        this.setBpmnInstances(td.bpmnInstances);

        this.bpmnInstances.forEach((elem, val) => {
            if(!elem.dataTestHeads)
                this.bpmnInstances[val].dataTestHeads = [];
        })
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

    setBpmnInstances(instances: DefinitionInstance[] = []){
        // this.bpmnInstances = [];
        // for(let i = instances.length - 1; i >= 0; i--){
        //     this.bpmnInstances.push(instances[i]);
        // }
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

    addBpmnInstance(instance = null){
        
        if(!instance){
           instance = this.newInstance();
        }
        let alreadyIn = false;
        this.bpmnInstances.forEach((elem, val) => {
            if(elem.version == instance.version && val != 0){
                alreadyIn = true;
            }
        });
        if(!alreadyIn){
            this.bpmnInstances.push(instance);
            this.setNewVersion()
        }
        
    }

    removeBpmnInstance(version){
        this.bpmnInstances.forEach((elem, val) =>{
            if(elem['version'] == version){
                this.bpmnInstances.splice(val, 1);
            }
        });
    }

    //Getter Methods

    getId(){
        return this._id;
    }

    getName(){
        return this.testName;
    }

    getDescription(){
        return this.testDescription;
    }

    getGroupId(){
        return this.groupId;
    }

    getProcessDefinitionKey(){
        return this.processDefinitionKey;
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

    newInstance() {
        return new DefinitionInstance();
    }





}
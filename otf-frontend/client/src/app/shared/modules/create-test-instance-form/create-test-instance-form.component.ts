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


import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import 'codemirror/mode/yaml/yaml.js';
import { TestInstanceService } from '../../services/test-instance.service';
import { TestDefinitionService } from '../../services/test-definition.service';
import { SchedulingService } from '../../services/scheduling.service';
import { SelectStrategyModalComponent } from '../select-strategy-modal/select-strategy-modal.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { Router } from '@angular/router';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';
import { ListService } from 'app/shared/services/list.service';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppGlobals } from "../../../app.global";
import { CookieService } from "ngx-cookie-service";
import * as  YAML from '../../../../../../node_modules/yamljs/lib/Yaml';
import 'codemirror/mode/javascript/javascript.js';
import beautify from 'json-beautify';
import { WorkflowRequest } from './instance.class';
import { PfloInputClass } from './instance.class';
import { GroupService } from 'app/shared/services/group.service';
import { ExecuteService } from 'app/shared/services/execute.service';

const URL = AppGlobals.baseAPIUrl + 'files';


@Component({
  selector: 'app-create-test-instance-form',
  templateUrl: './create-test-instance-form.component.pug',
  styleUrls: ['./create-test-instance-form.component.scss']
})
export class CreateTestInstanceFormComponent implements OnInit {
  yaml;
  //Variable sent between modules
  @Input() public existingInstance: any;

  @Output() public childEvent = new EventEmitter();
  public dataTemplate: any;
  public configTemplate: any;

  public codeConfig = {
    mode: "yaml",
    theme: "eclipse",
    lineNumbers: true
  };

  public codeJsonConfig = {
    mode: "application/json",
    theme: "eclipse",
    lineNumbers: true
  }

  public testDefinition;
  public testInstance;
  public createResult;
  public selectedDefinition;
  public errorCount = 0;
  public executionFailed = false;
  public editMode = false;
  public httpOptions;
  public selectedBpmn;
  public uploader: FileUploader;
  public isZip = true;
  public scriptFiles = [];
  public uploaders = {};
  public vthInput = {};
  public pfloInput = {};
  public argsToAdd = {};
  public vthInputYaml = {};
  public displayYAML = false;
  public testHeadYAML = false;
  public testHeadNames = {};
  public tiNameLookup = {};
  public instances;
  public search;
  public instanceAdded;
  

  public uploadOptions = {
    url: AppGlobals.baseAPIUrl + 'file-transfer',
    authTokenHeader: 'Authorization',
    authToken: 'Bearer ' + JSON.parse(this.cookie.get('access_token'))
  };

  // , private http: HttpClient, private Params: ParamsService, private cookie: CookieService
  constructor(private router: Router, private list: ListService, private dialog: MatDialog, private execute: ExecuteService, private testInstanceService: TestInstanceService, private testDefinitionService: TestDefinitionService, private snack: MatSnackBar, private http: HttpClient, private cookie: CookieService, private groupService: GroupService) {
    this.http = http;
    this.cookie = cookie;
    // this.httpOptions = {
    //     headers: new HttpHeaders({ 
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + JSON.parse(this.cookie.get('access_token'))
    //     })
    //   };
  }
  // testingSelect(){
  //   console.log(this.selectedBpmn);
  // }
  myFilter(bpmn) {
    return bpmn.isDeployed;
  }
  ngOnInit() {
    this.search = {};
    this.search.testInstanceName = '';
    this.testInstance = {};
    this.selectedDefinition = {};
    this.selectedBpmn = {};
    this.testInstance.useLatestTestDefinition = true;
    this.testInstance.simulationVthInput = {};
    let currentGroup;
    //options required for the file uploader
    currentGroup = this.groupService.getGroup();
    this.groupService.groupChange().subscribe(group => {
      currentGroup = group;
    });
    
    this.testInstanceService.find({
      groupId: currentGroup['_id'],
      $limit: -1,
      $sort: {
        createdAt: -1,
      },
      $select: ['testInstanceName']
    }).subscribe((result) => {
      this.instances = result;
      for(let i = 0; i < this.instances.length; i++){
        this.instances[i].isSelected = false;
      }
    })

    //File Uploaders
    //this.uploader = new FileUploader(uploadOptions);
    //if the user is using this page for editing an existing instance
    if (this.existingInstance) {
      //console.log(this.existingInstance)
      if (this.existingInstance.testInstance) {
        this.testInstance = this.existingInstance.testInstance;
        this.selectedDefinition = this.existingInstance.testInstance['testDefinitionId'];
        
        this.convertSimulationVth('string');
        console.log(this.testInstance);

        //set the bpmn to the selected bpmn. Alert User if no bpmn versions are deployed
        if (this.testInstance.useLatestTestDefinition) {
          this.useLatest();
        } else {
          for (let i = 0; i < this.selectedDefinition.bpmnInstances.length; i++) {
            if (this.selectedDefinition.bpmnInstances[i].processDefintionId === this.testInstance.processDefintionId) {
              this.selectedBpmn = this.selectedDefinition.bpmnInstances[i];
              break;
            }
          }
        }

        if (this.testInstance.testData === '') {
          this.displayYAML = true;
        }

        if (!this.testInstance.simulationVthInput) {
          this.testInstance.simulationVthInput = {};
        }


        //grab all robot test heads to assign uploaders to each and create the vthInput object
        //for(let j = 0; j < this.selectedBpmn.testHeads.length; j++){


        //}
        //console.log(this.uploaders);
        if (this.existingInstance.isEdit == true)
          this.editMode = true;
      }//if the user is creating a new instance from the test definition page
      else if (this.existingInstance.testDefinition) {
        this.selectedDefinition = this.existingInstance.testDefinition;
        this.populateTIName();
        //set the bpmn as the latest deployed version. Alert User if no bpmn versions are deployed
        this.useLatest();
        this.populateVthInput();
        this.populatePfloInput();
        //grab all robot test heads to assign uploaders to each and set the vthInput object
        for (let j = 0; j < this.selectedBpmn.testHeads.length; j++) {

          if (this.selectedBpmn.testHeads[j].testHeadId['testHeadName'].toLowerCase() === 'robot') {
            this.uploaders[this.selectedBpmn.testHeads[j].bpmnVthTaskId] = new FileUploader(this.uploadOptions);
          }
        }

        this.testInstance = {
          "testInstanceDescription": "",
          "testDefinitionId" : this.selectedDefinition["_id"],
          "vthInput" : this.vthInput,
          "pfloInput": this.pfloInput,
          "vthInputYaml": this.vthInputYaml,
          "testData": this.selectedBpmn.testDataTemplate,
          "testDataJSON": this.selectedBpmn.testDataTemplateJSON,
          "useLatestTestDefinition": true,
          "internalTestData": {},
          "simulationVthInput": {}
        };

      }
    }
    
  }

  convertSimulationVth(convertTo) {
    for (let key in this.testInstance.simulationVthInput) {
      if (this.testInstance.simulationVthInput.hasOwnProperty(key)) {
        if(convertTo == 'json')
          this.testInstance.simulationVthInput[key] = JSON.parse(this.testInstance.simulationVthInput[key]);
        else if (convertTo == 'string')
          this.testInstance.simulationVthInput[key] = beautify(this.testInstance.simulationVthInput[key], null, 2, 10);
      }
    }

  }
 


  simulationMode() {
    let def = {
      delay: 0, response: {}
    };
    //console.log(this.selectedBpmn);
    if (this.testInstance.simulationMode) {
      this.selectedBpmn.testHeads.forEach(e => {
        if(!this.testInstance.simulationVthInput){
          this.testInstance.simulationVthInput = {}
        }
        if (!this.testInstance.simulationVthInput[e.bpmnVthTaskId]) {
          this.testInstance.simulationVthInput[e.bpmnVthTaskId] = beautify(def, null, 2, 10);
        }
      })
    }
  }

  populateTIName() {
    let list;
    this.testInstanceService.find({ $limit: -1, $select: ['testInstanceName'], testDefinitionId: this.selectedDefinition._id }).subscribe((res) => {
      list = res;
      //console.log(list);
      let num = list.length;
      if (num === 0) {
        this.testInstance.testInstanceName = this.selectedDefinition.testName;
      } else {
        this.testInstance.testInstanceName = this.selectedDefinition.testName + num;
      }
      let isTaken = true;
      let count = 0;
      let alreadyExisted = false;
      while (isTaken === true && count < 10000) {
        for (let i = 0; i < list.length; i++) {
          if (list[i]["testInstanceName"] === this.testInstance.testInstanceName) {
            num++;
            this.testInstance.testInstanceName = this.selectedDefinition.testName + num;
            alreadyExisted = true;
            break;
          }
        }
        if (alreadyExisted) {
          alreadyExisted = false;
        } else {
          isTaken = false;
        }
        count++;
      }
    });
  }
  //Section for implementing Paralell workflow data entry --------------------------------------------------------------------------------------
  populatePfloInput(){
    // this.pfloInput = {
    //   "task123": new PfloInputClass
    // }
    //this.selectedBpmn.pflos = [{"bpmnPfloTaskId" : "task123", "label": "TestPFLO"}]
    
    if(this.testInstance.pfloInput){  
      return;
    }

    this.pfloInput = {};
   
    if(this.selectedBpmn == {} || !this.selectedBpmn.pflos){
      
      this.testInstance.pfloInput = this.pfloInput;
      return;
    }

    for(let i = 0; i < this.selectedBpmn.pflos.length; i++){
      if(this.selectedBpmn.pflos[i]['bpmnPfloTaskId'] != null){
        this.pfloInput[this.selectedBpmn.pflos[i]['bpmnPfloTaskId']] = new PfloInputClass;
       
        //this.pfloInput[this.selectedBpmn.pflos[i]['bpmnPfloTaskId'] + "pfloName"] = this.selectedBpmn.pflos[i]['label'];
      }
    }
    this.testInstance.pfloInput = this.pfloInput;
    
  }

  
  addInstancesToPflo(taskId){
    for(let i = 0; i < this.instances.length; i++){
      if(this.instances[i].isSelected){
        this.tiNameLookup[this.instances[i]._id] = this.instances[i].testInstanceName;
        this.addPfloInput(taskId, this.instances[i]._id);
      }

    }
  }

  addPfloInput(taskId, instanceId){
     
    this.testInstance.pfloInput[taskId].args.push(new WorkflowRequest(instanceId));
   
  }

  clearSelectedValues(){
    this.search.testInstanceName = '';
    for(let i = 0; i < this.instances.length; i++){
      this.instances[i].isSelected = false;
    }
  }

  saveTestDataOptions(event) {
    this.testInstance.testData = event.object;
  }

  saveFormOptions(event) {
    this.testInstance.vthInput[event.taskId] = event.object;
    //console.log(this.testInstance);
  }

  
  checkPfloInputLength(){
  
    if(this.testInstance.pfloInput != null){
      let temp =  Object.keys(this.testInstance.pfloInput);
      if(temp.length)
        return temp.length > 0;
      else
        return false;
    }else{
      return false;
    }
  }

  deleteWorkReq(pfloId, index){
    this.testInstance.pfloInput[pfloId].args.splice(index, 1);
    //FORCE REFRESH all connected forms to update their index
  }

  saveWorkReqForm(event) {
    this.testInstance.pfloInput[event.taskId].args[event.index] = event.object;
    //console.log(this.testInstance);
  }

  convertTestLevelYaml() {
    if (this.displayYAML) {
      this.testInstance.testDataJSON = YAML.parse(this.testInstance.testData);
    } else {
      this.testInstance.testData = YAML.stringify(this.testInstance.testDataJSON);
    }
  }

  convertVTHYaml() {
    if (this.testHeadYAML) {
      for (let key in this.testInstance.vthInputYaml) {
        this.testInstance.vthInput[key] = YAML.parse(this.testInstance.vthInputYaml[key]);
      }
    } else {

      for (let key in this.testInstance.vthInput) {
        this.testInstance.vthInputYaml[key] = YAML.stringify(this.testInstance.vthInput[key]);
      }
    }
  }
  //End of Paralell workflow data entry section --------------------------------------------------------------------------------------

  changeBpmn() {
    //populate the vth inputs when bpmn changes
    this.populateVthInput();
    this.displayYAML = !this.displayYAML;
    this.testInstance.testDataJSON = this.selectedBpmn.testDataTemplateJSON;
    this.testInstance.testData = this.selectedBpmn.testDataTemplate;
    this.convertTestLevelYaml();
    setTimeout(() => {
      this.displayYAML = !this.displayYAML;
    }, 200);

  }
  //toggle Yaml for test level data
  toggleYaml() {
    this.convertTestLevelYaml();
    this.displayYAML = !this.displayYAML;
  }
  //toggles Yaml for testHeads
  testHeadYaml() {
    this.convertVTHYaml();
    this.testHeadYAML = !this.testHeadYAML;
  }
  //onChange method for the use latest TD toggle
  useLatest() {
    if (this.testInstance.useLatestTestDefinition) {
      let temp;
      let orderNum;
      let processKey;
      for (let i = 0; i < this.selectedDefinition.bpmnInstances.length; i++) {
        if (temp) {
          processKey = this.selectedDefinition.bpmnInstances[i].processDefinitionId
          if(processKey){
            orderNum = processKey.split(":");
            orderNum = orderNum[1];
            //console.log("bpmn check : " + orderNum + " bpmn current: " + temp.processDefinitionId.split(':')[1]);
            if (this.selectedDefinition.bpmnInstances[i].isDeployed && parseInt(orderNum) > parseInt(temp.processDefinitionId.split(':')[1])) {
              temp = this.selectedDefinition.bpmnInstances[i];
            }
          }
        } else {
          if (this.selectedDefinition.bpmnInstances[i].isDeployed) {
            temp = this.selectedDefinition.bpmnInstances[i];
          }
        }

      }
      if (temp.isDeployed) {
        this.selectedBpmn = temp;
      } else {
        this.dialog.open(AlertModalComponent, {
          width: '450px',
          data: {
            type: 'alert',
            message: 'Test Definition does not contain a deployed bpmn instance. Please return to the Test Definition page and deploy.'
          }
        });
        this.testInstance.useLatestTestDefinition = false;
      }
      this.populateVthInput();
    }
    this.populatePfloInput();
  }

 
  //checks if the test instance has a required Name
  allNamed() {
    if (!this.testInstance.testInstanceName) {
      return false;
    }

    return true;
  }
  
  //populate the vthInputYaml for newly created testInstances
  populateVthInput() {
    this.vthInputYaml = {};
    this.vthInput = {};
    for (let i = 0; i < this.selectedBpmn.testHeads.length; i++) {
      this.vthInputYaml[this.selectedBpmn.testHeads[i].bpmnVthTaskId] = this.selectedBpmn.testHeads[i].testHeadId.vthInputTemplate;
      this.vthInputYaml[this.selectedBpmn.testHeads[i].bpmnVthTaskId + "testHeadName"] = this.selectedBpmn.testHeads[i].testHeadId.testHeadName;
      if (this.selectedBpmn.testHeads[i].testHeadId.vthInputTemplateJSON) {
        this.vthInput[this.selectedBpmn.testHeads[i].bpmnVthTaskId] = this.selectedBpmn.testHeads[i].testHeadId.vthInputTemplateJSON;
        this.vthInput[this.selectedBpmn.testHeads[i].bpmnVthTaskId + "testHeadName"] = this.selectedBpmn.testHeads[i].testHeadId.testHeadName;
      }

    }

  }
  //Used to grab all test definitions for the user to select.
  getDefinition() {
    const dialogRef = this.dialog.open(SelectStrategyModalComponent, {
      width: '450px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      //If the user already had a selected definition and selected a new one, prompt the user to be sure of change
      if (result != '' && this.selectedDefinition.testName) {
        this.dialog.open(AlertModalComponent, {
          width: '450px',
          data: {
            type: 'confirmation',
            message: 'Changing the Test Definition will erase the Instance you are currently writing.'
          }
        }).afterClosed().subscribe(response => {
          if (response) {
            this.selectedDefinition = result;            
            this.populateTIName();
            //set the bpmn as the latest deployed version. Alert User if no bpmn versions are deployed
            this.useLatest();
            this.populateVthInput();
            this.populatePfloInput();
            //grab all robot test heads to assign uploaders to each and initialize vthInput
            for (let j = 0; j < this.selectedBpmn.testHeads.length; j++) {
              if (this.selectedBpmn.testHeads[j].testHeadId['vthInputTemplateJSON']) {
                this.vthInput[this.selectedBpmn.testHeads[j].bpmnVthTaskId] = this.selectedBpmn.testHeads[j].testHeadId['vthInputTemplateJSON'];
              }

              if (this.selectedBpmn.testHeads[j].testHeadId['testHeadName'].toLowerCase() === 'robot') {
                this.uploaders[this.selectedBpmn.testHeads[j].bpmnVthTaskId] = new FileUploader(this.uploadOptions);
              }
            }

            this.testInstance = {
              "testInstanceDescription": "",
              "groupId": this.selectedDefinition["groupId"],
              "testDefinitionId": this.selectedDefinition["_id"],
              "vthInput": this.vthInput,
              "pfloInput": this.pfloInput,
              "vthInputYaml": this.vthInputYaml,
              "testData": this.selectedBpmn.testDataTemplate,
              "testDataJSON": this.selectedBpmn.testDataTemplateJSON,
              "useLatestTestDefinition": true,
              "internalTestData": {},
              "simulationVthInput": {}

            };
          }
        });

        //else they did not have a test definition currently selected
      } else {
        this.selectedDefinition = result;
        this.populateTIName();
        //set the bpmn as the latest deployed version. Alert User if no bpmn versions are deployed
        this.useLatest();
        this.populateVthInput();
        this.populatePfloInput();
        //grab all robot test heads to assign uploaders to each
        for (let j = 0; j < this.selectedBpmn.testHeads.length; j++) {
          if (this.selectedBpmn.testHeads[j].testHeadId['vthInputTemplateJSON']) {
            this.vthInput[this.selectedBpmn.testHeads[j].bpmnVthTaskId] = this.selectedBpmn.testHeads[j].testHeadId['vthInputTemplateJSON'];
          }
          if (this.selectedBpmn.testHeads[j].testHeadId['testHeadName'].toLowerCase() === 'robot') {
            this.uploaders[this.selectedBpmn.testHeads[j].bpmnVthTaskId] = new FileUploader(this.uploadOptions);
          }
        }
             
          
         
          this.testInstance = {
            "testInstanceDescription": "",
              "groupId": this.selectedDefinition["groupId"],
              "testDefinitionId": this.selectedDefinition["_id"],
              "vthInput": this.vthInput,
              "pfloInput": this.pfloInput,
              "vthInputYaml": this.vthInputYaml,
              "testData": this.selectedBpmn.testDataTemplate,
              "testDataJSON": this.selectedBpmn.testDataTemplateJSON,
              "useLatestTestDefinition": true,
              "internalTestData": {},
              "simulationVthInput": {}
          };
          
        }
    });
  }

  //Saves the Test Instance Object to the database 
  saveAll() {
    if (!this.allNamed()) {
      this.dialog.open(AlertModalComponent, {
        width: '450px',
        data: {
          type: 'alert',
          message: 'The Instance is not named! Please ensure the Instance are named.'
        }
      }).afterClosed().subscribe((result) => {
        return;
      });
    } else {

      if (!this.testInstance.processDefinitionId) {
        this.testInstance.processDefinitionId = this.selectedBpmn.processDefinitionId;
      }
      this.errorCount = 0;
      if (!this.displayYAML) {
        this.testInstance.testData = this.testInstance.testDataJSON;
      }
      if (this.testHeadYAML) {
        this.testInstance.vthInput = this.testInstance.vthInputYaml;
      }

      this.convertSimulationVth('json');

      this.testInstanceService.create(this.testInstance)
        .subscribe(
          (result) => {
            if (Object.keys(this.uploaders).length > 0)
              this.uploadFiles(result);

            this.snack.openFromComponent(AlertSnackbarComponent, {
              duration: 1500,
              data: {
                message: 'Test Instance Saved'
              }
            });
            this.dialog.closeAll();
          },
          (error) => {
            this.dialog.open(AlertModalComponent, {
              width: '450px',
              data: {
                type: 'Alert',
                message: error
              }
            });

          });
    }
  }

  updateInstance() {


    if (!this.testInstance.processDefinitionId) {
      this.testInstance.processDefinitionId = this.selectedBpmn.processDefinitionId;
    }
    this.errorCount = 0;
    if (!this.displayYAML) {
      this.testInstance.testData = this.testInstance.testDataJSON;
    }
    if (this.testHeadYAML) {
      this.testInstance.vthInput = this.testInstance.vthInputYaml;
    }

    this.convertSimulationVth('json');

    this.testInstanceService.update(this.testInstance)
      .subscribe((result) => {
        this.snack.openFromComponent(AlertSnackbarComponent, {
          duration: 1500,
          data: {
            message: 'Test Instance Updated'
          }
        });
        this.childEvent.emit();
      });
  }

  cancel() {
    this.childEvent.emit();
  }
  uploadFiles(result) {
    for (let i = 0; i < this.selectedBpmn.testHeads.length; i++) {
      if (!this.uploaders[this.selectedBpmn.testHeads[i].bpmnVthTaskId]) {
        continue;
      }
      let key = this.selectedBpmn.testHeads[i].bpmnVthTaskId;
      let uploader = this.uploaders[key];
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
        uploader.onCompleteItem = (item: FileItem, response: string, status: Number, headers: ParsedResponseHeaders) => {
          this.scriptFiles.push(JSON.parse(response)[0]);
        }
      }
      uploader.onCompleteAll = () => {

        let scriptFilesId = [];
        for (let i = 0; i < this.scriptFiles.length; i++) {
          scriptFilesId.push(this.scriptFiles[i]['_id']);
        }
       
        for (let i = 0; i < this.selectedBpmn.testHeads.length; i++) {
          if (this.selectedBpmn.testHeads[i].testHeadId['testHeadName'].toLowerCase() === 'robot') {
            this.testInstance.internalTestData[this.selectedBpmn.testHeads[i].bpmnVthTaskId] =
              {
                "robotFileId": scriptFilesId[0]
              };
          }
        }
        let ti = {
          '_id': result._id,
          'internalTestData': this.testInstance.internalTestData
        }

        this.testInstanceService.patch(ti).subscribe(
          res => {
            //console.log(res);
            // resolve(res);
          },
          err => {
            // console.log(err);
            // reject(err);
          }
        );
      }
    }
  }
  //saves instance to the database and executes the test using the agenda scheduler
  saveAndExecute() {
    if (!this.allNamed()) {
      this.dialog.open(AlertModalComponent, {
        width: '450px',
        data: {
          type: 'alert',
          message: 'One or more Instance is not named! Please ensure all Instances are named.'
        }
      }).afterClosed().subscribe((result) => {
        return;
      });
    } else {

      if (!this.testInstance.processDefinitionId) {
        this.testInstance.processDefinitionId = this.selectedBpmn.processDefinitionId;
      }
      this.errorCount = 0;
      if (!this.displayYAML) {
        this.testInstance.testData = this.testInstance.testDataJSON;
      }
      if (this.testHeadYAML) {
        this.testInstance.vthInput = this.testInstance.vthInputYaml;
      }

      this.convertSimulationVth('json')

      this.testInstanceService.create(this.testInstance)
        .subscribe(
          (result) => {
            this.executionFailed = false;
            this.createResult = result;
            if (Object.keys(this.uploaders).length > 0)
              this.uploadFiles(result);


            this.execute.create({
              _id: this.createResult._id,
              async: true
            })
              .subscribe(
                (response) => {

                  this.childEvent.emit();
                  this.snack.openFromComponent(AlertSnackbarComponent, {
                    duration: 1500,
                    data: {
                      message: 'Test Instance Saved and Executed'
                    }
                  });
                  this.router.navigateByUrl('/dashboard');
                },
                (error) => {
                  this.executionFailed = true;
                  this.dialog.open(AlertModalComponent, {
                    width: '450px',
                    data: {
                      type: 'Alert',
                      message: "Execution error: " + error
                    }
                  });
                });
          },
          (error) => {
            this.dialog.open(AlertModalComponent, {
              width: '450px',
              data: {
                type: 'Alert',
                message: "Save Error: " + error
              }
            });
          });
    }
  }

  createNewInstance() {
    this.testInstance = {
      'testInstanceName': '',
      'testInstanceDescription': '',
      'testDefinitionId': this.selectedDefinition._id,
      'testData': '',
      'simulationVthInput': {}

    }
  }
}

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


import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SelectTestHeadModalComponent } from '../select-test-head-modal/select-test-head-modal.component';
import { GroupService } from '../../services/group.service';
import { TestDefinitionService } from '../../services/test-definition.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { Alert } from 'selenium-webdriver';
import { ListService } from '../../services/list.service';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';
import { TestHeadService } from 'app/shared/services/test-head.service';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppGlobals } from 'app/app.global';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { stringify } from '@angular/core/src/render3/util';
import Modeler from 'bpmn-js';
import { FileService } from 'app/shared/services/file.service';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { TestDefinition } from './test-definition.class';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Buffer } from 'buffer';
import { ViewWorkflowModalComponent } from '../view-workflow-modal/view-workflow-modal.component';
import { BpmnFactoryService } from 'app/shared/factories/bpmn-factory.service';
import { Bpmn } from 'app/shared/models/bpmn.model';


@Component({
  selector: 'app-create-test-form',
  templateUrl: './create-test-form.component.pug',
  styleUrls: ['./create-test-form.component.scss']
})
export class CreateTestFormComponent implements OnInit, OnDestroy {


  public codeConfig = {
    mode: 'yaml',
    theme: 'eclipse',
    lineNumbers: true
  };

  public trackByFn;

  public selectedTestHead;
  public groups;
  public isUploading;
  public successUpload = false;
  public processDefinitionKey = false;
  public validateResponse;
  public pStatus;
  public file: File;
  public hasBeenSaved = false;
  public saved = false;
  public isClicked;
  public isZip = true;
  public viewer: Bpmn;
  public scriptFiles = [];
  public existingTd;

  @ViewChild('testDefinitionForm') form: any;
  @ViewChild('canvas') canvas;
  @ViewChild('scripts') scripts: ElementRef;
  @ViewChild('file') bpmnFileInput: ElementRef;

  @Input() public listKey;

  @Input() public formData;

  @Output() public childEvent = new EventEmitter();

  public uploader: FileUploader;
  public bpmnUploader: FileUploader;

  public inProgress = false;

  // New variables
  public ptd: TestDefinition;
  public isNew = true;

  constructor(
    public dialog: MatDialog,
    private list: ListService,
    private testHead: TestHeadService,
    private group: GroupService,
    private testDefinition: TestDefinitionService,
    private snack: MatSnackBar,
    private cookie: CookieService,
    private fileTransfer: FileTransferService,
    private fileService: FileService,
    private bpmnFactory: BpmnFactoryService
    ) { }

  print(){
    console.log(this.ptd);
  }

  async ngOnInit() {
    //this.setNew();

    this.viewer = await this.bpmnFactory.setup({
      mode: 'viewer',
      options: {
        container: this.canvas.nativeElement
      }
    })
    
    this.ptd = new TestDefinition();
    this.ptd.reset();
    this.ptd.switchVersion();

    let uploadOptions = {
      url: AppGlobals.baseAPIUrl + 'file-transfer',
      authTokenHeader: 'Authorization',
      authToken: 'Bearer ' + JSON.parse(this.cookie.get('access_token'))
    };

    //File Uploaders
    this.uploader = new FileUploader(uploadOptions);
    this.bpmnUploader = new FileUploader(uploadOptions);

    if (this.formData && this.formData !== 'new') {
      this.hasBeenSaved = true;
      this.successUpload = true;
      this.isNew = false;
      this.setTestDefinition();
    }

    this.group.find({$limit: -1}).subscribe((x) => {
      this.groups = x;
    });

  }

  ngOnDestroy(){
    
  }

  waitSave(){
    return new Promise((resolve, reject) => {
      console.log('waitsave')
      //upload bpmn file
      this.saveBpmnFile().then(bpmnFile => {
        console.log(bpmnFile)
        console.log('pass save bpmnfile')
        this.checkTestDataTemplate();

        let data = this.gatherTestDefinition(bpmnFile);
        console.log(data)
        //If this is not a new version
        if(!this.existingTd){
          delete data._id;
          
          this.create(data).then(
            result => {
              resolve(result);
              this.setTestDefinition(result);
              this.showHasBeenSaved();
            }
          ).catch(err => {
            reject(err);
            this.showHasNotBeenSaved();
          });
        }else{
          //create version by updating definition
          this.saveVersion(data).then(
            result => {
              resolve(result);
              this.setTestDefinition(result);
              this.showHasBeenSaved();
            }
          ).catch(err => {
            reject(err);
            this.showHasNotBeenSaved();
          });
        }
      });
    })
  }
  
  // Saves Test Definition - Triggered by "Save" button
  save() {
    //set in progress
    this.inProgress = true;
    return this.waitSave();

  }

  // Updates Test Definition - Triggered by "Update" button
  update() {
    this.inProgress = true;
    return this.saveBpmnFile().then(bpmnFile => {
      this.checkTestDataTemplate();

      var data = this.gatherTestDefinition(bpmnFile);

      return this.testDefinition.patch(data)
        .subscribe(
          result => {
            this.uploadResources(result).then(
              res => {
                this.setTestDefinition(res);
                this.showHasBeenUpdated();
              }
            );
            return result;
          },
          error => {
            this.showHasNotBeenUpdated(error);
          }
        );
    });
  }

  deleteVersion(){
    let deleteDialog = this.dialog.open(AlertModalComponent, {
      width: '250px',
      data: { type: 'confirmation', message: 'Are you sure you want to delete version ' + this.ptd.currentVersionName }
    });

    deleteDialog.afterClosed().subscribe(
      result => {
        if(result){
          this.inProgress = true;
          if(this.ptd.bpmnInstances.length == 1){
            this.testDefinition.delete(this.ptd._id).subscribe(
              result => {
                this.childEvent.emit();
              }
            )
          }else{
            this.ptd.removeBpmnInstance(this.ptd.currentVersionName);
            this.update().then(
              res => {
                this.inProgress = false;
              }
            );
          }
        }
      }
    )
  }

  // Deploys Test Definition version - Triggerd by "Deploy" button
  deploy(versionName?) {
    this.inProgress = true;
    //console.log(this.ptd)
    this.testDefinition.deploy(this.ptd, versionName)
      .subscribe(result => {
        
        this.handleResponse(result);
        this.inProgress = false;
        if (result['statusCode'] == 200) {
          this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: {
              message: 'Test Definition Deployed!'
            }
          });
          this.ptd.currentInstance.isDeployed = true;
        } else {
          this.dialog.open(AlertModalComponent, {
            width: '250px',
            data: {
              type: 'Alert',
              message: JSON.stringify(result)
            }
          });
        }
      },
        err => {
          this.inProgress = false;
        }

      );
  }

  create(data){
    return new Promise((resolve, reject) => {
      this.testDefinition.create(data)
        .subscribe(
          result => {
            this.uploadResources(result).then(
              res => {
                resolve(res);
              }
            );
          },
          error => {
            this.dialog.open(AlertModalComponent, {
              width: '250px',
              data: {
                type: 'Alert',
                message: JSON.stringify(error)
              }
            });
            reject(error);
          }
        );
    });
  }

  newVersion(processDefinitionKey){
    this.hasBeenSaved = false;
    this.isNew = true;
    this.ptd.reset();
    this.ptd.switchVersion();
    this.ptd.setProcessDefinitionKey(processDefinitionKey);
  }

  checkProcessDefinitionKey() {
    this.pStatus = 'loading';
    this.testDefinition.check(this.ptd.getProcessDefinitionKey()).subscribe(result => {
      console.log(result);
      if (result['statusCode'] == 200) {
        this.pStatus = 'unique';
      } else {
        this.pStatus = 'notUnique';
      }

      this.ptd.bpmnInstances = this.ptd.bpmnInstances.filter((e, i) => {
        return i == 0;
      })
      
      // this.ptd.bpmnInstances.forEach((elem, val) => {
      //   if(val > 0){
      //     this.ptd.bpmnInstances.splice(val, 1);
      //   }
      // })

      //New Code
      if(result['body'] && result['body'][0]){
        //when changing bpmn dont
        //if(this.ptd.currentInstance.isDeployed){
          let res = result['body'][0];
          this.existingTd = true;
          this.ptd.setId(res._id);
          this.ptd.setName(res.testName);
          this.ptd.setDescription(res.testDescription);
          this.ptd.setGroupId(res.groupId);
          this.ptd.setVersion(res.bpmnInstances.length + 1);
          //this.ptd.bpmnInstances = [];

          for(let i = 0; i < res.bpmnInstances.length; i++){
            this.ptd.addBpmnInstance(res.bpmnInstances[i]);
          }

          
          //this.ptd.addBpmnInstance (res.bpmnInstances);
        //}
      }else{
        this.existingTd = false;
        this.ptd.setId(null);
        this.ptd.setName('');
        this.ptd.setDescription('');
        this.ptd.setGroupId('');
        this.ptd.setVersion(1);
      }

      if(!this.ptd.currentInstance.version){
        this.ptd.setNewVersion();
      }

    });
  }

  validateFile() {

    this.isUploading = true
    this.fetchFileContents(val => {
      //
      this.ptd.currentInstance.bpmnXml = val;
      if (!this.ptd.currentInstance.bpmnXml) {
        this.isUploading = false;
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: {
            type: 'Alert',
            message: 'File was not selected. Please try again.'
          }
        });
        return null;
      }
      
      this.testDefinition.validate(this.ptd.getAll())
        .subscribe(
          result => {
            this.handleResponse(result);
            //
            this.isUploading = false;
            this.ptd.currentInstance.bpmnHasChanged = true;
            this.loadDiagram();
          },
          err => {
            this.dialog.open(AlertModalComponent, {
              width: '250px',
              data: {
                type: 'Alert',
                message: 'Something went wrong. Please try again'
              }
            });
            this.isUploading = false;
          }
        );
    });


  }

  showHasNotBeenSaved(){
    this.dialog.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'Alert',
        message: 'There was a problem with saving the test definition.'
      }
    });
    this.inProgress = false;
  }

  showHasBeenSaved(){
    this.snack.openFromComponent(AlertSnackbarComponent, {
      duration: 1500,
      data: {
        message: 'Test Definition Saved!'
      }
    });
    //this.switchVersion();
    this.ptd.switchVersion();
    this.hasBeenSaved = true;
    this.saved = true;
    this.form.form.markAsPristine();
    this.inProgress = false;
  }

  showHasBeenUpdated(){
    this.snack.openFromComponent(AlertSnackbarComponent, {
      duration: 1500,
      data: {
        message: 'Test Definition Updated!'
      }
    });
    //this.switchVersion();
    this.ptd.switchVersion(this.ptd.currentInstance.version);
    this.saved = true;
    this.form.form.markAsPristine();
    this.ptd.currentInstance.bpmnHasChanged = false;
    this.inProgress = false;
  }

  showHasNotBeenUpdated(error = null){
    this.dialog.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'Alert',
        message: JSON.stringify(error)
      }
    });
    this.inProgress = false;
  }

  setTestDefinition(data = null){
    //new
    if(data){
      
      this.ptd.setAll(data);
    }else{
      this.ptd.setAll(JSON.parse(JSON.stringify(this.formData)));
    }

    this.switchVersion();

    //console.log(this.ptd);
    
  }

  clearQueue(){
    this.uploader.clearQueue();
    if(this.scripts){
      this.scripts.nativeElement.value = null;
    }
  }

  switchVersion(versionName = null){
    this.ptd.switchVersion(versionName);
    this.checkTestDataTemplate();

    this.clearQueue();
    this.bpmnFileInput.nativeElement.value = null;

    //Get bpmn file contents
    this.fileTransfer.get(this.ptd.currentInstance.bpmnFileId).subscribe(
      result => {
        result = new Buffer(result as Buffer);
        this.ptd.currentInstance.bpmnXml = result.toString();
        this.loadDiagram();
      }
    );

    //get info on resource file
    if(this.ptd.currentInstance.resourceFileId){
      this.fileService.get(this.ptd.currentInstance.resourceFileId).subscribe(
        result => {
          this.ptd.currentInstance.resourceFileName = result['filename'];
        }
      )
    }

    if(this.ptd.currentInstance.testHeads){
      this.ptd.currentInstance.dataTestHeads = [];
      this.ptd.currentInstance.testHeads.forEach((elem, val) => {
        //Find test head info
        const e = elem;
        this.testHead.get(e.testHeadId).subscribe(
          result => {
            this.ptd.currentInstance.dataTestHeads.push({
              testHeadId: e.testHeadId,
              bpmnVthTaskId: e.bpmnVthTaskId,
              testHead: JSON.parse(JSON.stringify(result))
            });
          },
          err => {
            this.ptd.currentInstance.dataTestHeads.push({
              testHeadId: e.testHeadId,
              bpmnVthTaskId: e.bpmnVthTaskId,
              testHead: { _id: e.testHeadId, testHeadName: 'No Access' }
            });
          }
        );
      });
    }
  }

  gatherTestDefinition(bpmnFile = null) {

    if(bpmnFile){
      this.ptd.currentInstance.bpmnFileId = bpmnFile._id;
    }

    this.ptd.currentInstance.testHeads = [];
    this.ptd.currentInstance.dataTestHeads.forEach((elem, val) => {
      this.ptd.currentInstance.testHeads.push({
        testHeadId: elem.testHead._id,
        bpmnVthTaskId: elem.bpmnVthTaskId
      });
    });

    return this.ptd.getAll();
  
  }

  saveDeploy() {
    let version = JSON.parse(JSON.stringify(this.ptd.currentInstance.version));
    console.log(version)
    this.save().then(x => {
      this.deploy(version);
    });
  }

  updateDeploy() {
    let version = JSON.parse(JSON.stringify(this.ptd.currentInstance.version));
    this.update().then(x => {
      this.deploy(version);
    });
  }S

  handleResponse(result) {
    this.successUpload = true;
    this.processDefinitionKey = false;
    //this.validateResponse = result;
    if (result['body']['errors']) {


      if (result['body']['errors']['processDefinitionKey']) {
        this.openProcessDefinitionKeyModal();
        this.pStatus = 'notUnique';
        this.ptd.setProcessDefinitionKey(result['body'].errors.processDefinitionKey.key)
        //this.td.processDefinitionKey = result['body']['errors']['processDefinitionKey']['key'];
        this.processDefinitionKey = true;
      }
      if (result['body']['errors']['notFound']) {
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: { type: 'alert', message: result['body']['errors']['notFound']['error'] }
        });
        this.successUpload = false;
      }
      if (result['body']['errors']['startEvent']) {
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: { type: 'alert', message: result['body']['errors']['startEvent']['error'] }
        });
        this.successUpload = false;
      }
      if (result['body']['errors']['required']) {
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: { type: 'alert', message: result['body']['errors']['required']['error'] }
        });
        this.successUpload = false;
      }
      if (result['body']['errors']['permissions']) {
        let mess = '';
        result['body']['errors']['permissions'].forEach(elem => {
          mess += elem.error + '\n';
        })
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: { type: 'alert', message: mess }
        });
        this.successUpload = false;
      }

    }else{
      this.markAsDirty();
    }
    // Update list of test heads
    if (result['body']['bpmnVthTaskIds']) {
      this.ptd.currentInstance.dataTestHeads = result['body'].bpmnVthTaskIds;
      this.ptd.currentInstance.testHeads = [];
      //this.definitionInstance.testHeads = result['body']['bpmnVthTaskIds'];
    }

    //Update plfos list
    if(result['body']['bpmnPfloTaskIds']){
      this.ptd.currentInstance.pflos = result['body'].bpmnPfloTaskIds;
    }

    if (result['body']['processDefinitionKey']) {
      this.ptd.setProcessDefinitionKey(result['body'].processDefinitionKey);
      //this.td.processDefinitionKey = result['body']['processDefinitionKey'];
      this.checkProcessDefinitionKey()
    }
  }

  markAsDirty() {
    this.form.control.markAsDirty();
  }

  //returns promise for file object 
  saveBpmnFile() {
    return new Promise((resolve, reject) => {

      //check for bpmnXml
      if (!this.ptd.currentInstance.bpmnXml) {
        this.dialog.open(AlertModalComponent, {
          width: '250px',
          data: {
            type: 'Alert',
            message: 'No File found. Please select a file to upload'
          }
        });
        reject();
      }

      if(this.ptd.currentInstance.bpmnHasChanged){
        // Upload
        console.log('validate save call')
        this.testDefinition.validateSave(this.ptd).subscribe(
          result => {
            resolve(JSON.parse(result.toString())[0]);
          }
        );
      }else{
        //bpmn has not changed, so did not save it.
        resolve(null);
      }
    });
  }

  saveVersion(data){
    return new Promise((resolve, reject) => {

      let newBpmnInsance = JSON.parse(JSON.stringify(data.bpmnInstances[0]));
      delete data.bpmnInstances;
      data['$push'] = {
        bpmnInstances: newBpmnInsance
      }

      console.log(data)

      this.testDefinition.patch(data).subscribe(
        result => {
          this.uploadResources(result).then(
            res => {
              resolve(res);
            }
          )
        },
        err => {
          reject(err);
        }
      )
    });
  }

  uploadResources(td){
    return new Promise((resolve, reject) => {
      if(this.uploader.queue.length > 0){
        //console.log('has file');
        this.uploader.uploadAll();
        this.uploader.onCompleteItem = (item: FileItem, response: string, status: Number, headers: ParsedResponseHeaders) => {
          this.scriptFiles.push(JSON.parse(response)[0]);
          //console.log('in file')
        }
        this.uploader.onCompleteAll = () => {
          //console.log('complete')
          let scriptFilesId = [];
          for (let i = 0; i < this.scriptFiles.length; i++) {
            scriptFilesId.push(this.scriptFiles[i]['_id']);
          }
          td['bpmnInstances'][this.ptd.currentVersion]['resourceFileId'] = scriptFilesId[0];
          //console.log(td);
          this.testDefinition.patch(td).subscribe(
            res => {
              //console.log(res);
              resolve(res);
            },
            err => {
              reject(err);
            }
          );
        }
      }else{
        resolve(td);
      }
    });
  }

  checkTestDataTemplate() {
    if (this.ptd.currentInstance.testDataTemplate == null || this.ptd.currentInstance.testDataTemplate == '') {
      delete this.ptd.currentInstance.testDataTemplate;
    }
    // if (this.definitionInstance.testDataTemplate == null || this.definitionInstance.testDataTemplate == '') {
    //   delete this.definitionInstance.testDataTemplate;
    // }
  }

  async loadDiagram() {
    if (this.ptd.currentInstance.bpmnXml) {
      //render xml and display
      this.viewer.setBpmnXml(this.ptd.currentInstance.bpmnXml);
      // if (!this.viewer) {
      //   this.viewer = new Modeler({
      //     container: this.canvas.nativeElement
      //   });
      // }

      // this.viewer.importXML(this.ptd.currentInstance.bpmnXml, (err) => {
      //   if (!err) {
      //     this.viewer.get('canvas').zoom('fit-viewport');
      //   } else {
      //     //
      //   }
      // });

    }
  }

  enlargeBpmn(){
    this.dialog.open(ViewWorkflowModalComponent, {
      data: {
        xml: this.ptd.currentInstance.bpmnXml
      },
      width: '100%',
      height: '100%'
    })
  }

  fetchFileContents(callback) {
    var val = "x";
    var fileToLoad = (document.getElementById('file'))['files'][0];
    var fileReader = new FileReader();
    if (!fileToLoad) {
      return null;
    }
    fileReader.onload = function (event) {
      //
      val = event.target['result'] as string;

      //
      callback(val);
    }
    fileReader.readAsText(fileToLoad);
  }

  openProcessDefinitionKeyModal() {
    const dialogRef = this.dialog.open(AlertModalComponent, {
      width: '250px',
      data: { type: 'warning', message: 'You cannot use this process definition key. Please change it.' }
    });
  }

  checkVersionUnique(){
    let exists = false;
    this.ptd.bpmnInstances.forEach(elem => {
      if(elem != this.ptd.currentInstance && elem.version == this.ptd.currentInstance.version){
        exists = true;
      }
    });

    if(exists){
      this.form.controls['version'].setErrors({error: 'Version Already Exists'});
    }else{
      this.form.controls['version'].setErrors(null);
    }
  }

}
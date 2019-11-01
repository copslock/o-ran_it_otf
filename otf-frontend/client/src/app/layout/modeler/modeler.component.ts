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


import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import minimapModule from 'diagram-js-minimap';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { Buffer } from 'buffer';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import * as camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import * as vthTemplate from './templates/elements.json';
import * as $ from 'jquery';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TestHeadService } from 'app/shared/services/test-head.service';
import { GroupService } from 'app/shared/services/group.service';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { CookieService } from 'ngx-cookie-service';
import { FileService } from 'app/shared/services/file.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BpmnFactoryService } from 'app/shared/factories/bpmn-factory.service';
import { Bpmn } from 'app/shared/models/bpmn.model';
import { TestDefinitionElement, BpmnInstanceElement } from './test-definition-element.class.js';
import { FileUploader } from 'ng2-file-upload';
import { Group } from 'app/shared/models/group.model.js';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';

interface NewVersionOptions {
  versionIndex: number,
  fromFile: Boolean
}

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.pug',
  styleUrls: [
    './modeler.component.scss',
  ]
})

export class ModelerComponent implements OnInit {

  @ViewChild('container') containerElement: ElementRef;
  @ViewChild('modeler') modelerElement: ElementRef;
  @ViewChild('sidebar') sidebarElement: ElementRef;
  @ViewChild('properties') propertiesElement: ElementRef;
  @ViewChild('handle') handleElement: ElementRef;

  @ViewChild('testDefinitionForm') form: any;
  @ViewChild('scripts') scripts: ElementRef;
  @ViewChild('file') bpmnFileInput: ElementRef;

  public qpTestDefinitionId;

  public ptd: TestDefinitionElement;
  public uploader: FileUploader;
  public bpmnUploader: FileUploader;
  public pStatus: String;
  public inProgress: Boolean;
  public groups: Array<Group>;
  public modeler: Bpmn;
  public showProperties = true;
  public isResizing = false;
  public lastDownX = 0;
  public propertiesWidth = '500px';
  public showSidebar = true;
  public showTestDefinition = false;
  public bpmnId; //javascript input element
  public isRefreshed = false;
  public hasBeenSaved: Boolean = false;

  constructor(
    public _dialog: MatDialog,
    private _testHeads: TestHeadService,
    private _groups: GroupService,
    private _testDefinitions: TestDefinitionService,
    private _snack: MatSnackBar,
    private _fileTransfer: FileTransferService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _bpmnFactory: BpmnFactoryService) {
  }

  @HostListener('window:beforeunload', ['$event'])
  canLeavePage($event) {
    $event.preventDefault();
    alert('are you sure')
  }

  async ngOnInit() {

    this._route.queryParams.subscribe(res => {
      if (res.testDefinitionId) {
        this.qpTestDefinitionId = res.testDefinitionId;
      } else {
        this.qpTestDefinitionId = null;
      }
      this.setup();
    })

    //set groups list
    this._groups.find({
      $limit: -1,
      lookup: 'both'
    }).subscribe(res => {
      this.groups = res as Array<Group>;
      this.groups = this._groups.organizeGroups(this.groups);
      
    });

  }

  async setup() {

    this.setInProgress(true);

    await this.setTestDefinition();

    const modelerOptions = {
      container: this.modelerElement.nativeElement,
      propertiesPanel: {
        parent: '#properties'
      },
      elementTemplates: [vthTemplate],
      additionalModules: [
        minimapModule,
        propertiesPanelModule,
        propertiesProviderModule
        // colorPickerModule,
        // logTestResultDrawModule,
        // logTestResultPaletteModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      },
      keyboard: {
        bindTo: document
      }
    };

    // Set up empty modeler
    await this.setModeler({
      mode: 'modeler',
      options: modelerOptions
    });

    this.setBpmn(false);

    //set ups draggable properties container
    $(this.handleElement.nativeElement).on('mousedown', e => {
      this.lastDownX = e.clientX;
      this.isResizing = true;
    });

    $(document).on('mousemove', e => {
      if (!this.isResizing)
        return;

      var offsetRight = $(this.containerElement.nativeElement).width() - (e.clientX - $(this.containerElement.nativeElement).offset().left);

      $(this.modelerElement.nativeElement).css('right', offsetRight);
      $(this.sidebarElement.nativeElement).css('width', offsetRight);
    }).on('mouseup', e => {
      this.isResizing = false;
    });


  }

  /*****************************************
   * Form Functionality Methods
   ****************************************/

  /*** BUTTONS ***/

  async newWorkflow() {
    if (this.qpTestDefinitionId) {
      this._router.navigate([], {
        queryParams: {}
      });
    } else {
      this.setup();
    }
  }

  async download() {
    this.modeler.download();
  }

  async save() {
    this.setInProgress(true);
    let validResult = await this.validateFile();

    if (validResult) {
      if (this.hasBeenSaved) {
        await this.updateDefinition();
      } else {
        let td = await this.saveDefinition();
        this._router.navigate([], {
          queryParams: {
            testDefinitionId: td['_id']
          }
        });
      }
    }

    this.snackAlert('Version ' + this.ptd.currentVersionName + ' has been saved');
    this.setInProgress(false);
    this.markFormAs('pristine');
  }

  async deploy(versionName?) {
    this.inProgress = true;

    this._testDefinitions.deploy(this.ptd, versionName)
      .subscribe(
        result => {
          this.inProgress = false;
          if (result['statusCode'] == 200) {
            this.snackAlert('Test Definition Deployed Successfully')
            this.ptd.currentInstance.isDeployed = true;
          } else {
            this.errorPopup(result.toString());
          }
        },
        err => {
          this.errorPopup(err.toString());
          this.setInProgress(false);
        }

      );
  }

  async deleteVersion() {
    let deleteDialog = this._dialog.open(AlertModalComponent, {
      width: '250px',
      data: { type: 'confirmation', message: 'Are you sure you want to delete version ' + this.ptd.currentVersionName }
    });

    deleteDialog.afterClosed().subscribe(
      result => {
        if (result) {
          this.setInProgress(true);
          if (this.ptd.bpmnInstances.length == 1) {
            this._testDefinitions.delete(this.ptd._id).subscribe(
              result => {
                this.snackAlert('Test definition was deleted');
                this.setInProgress(false);
                this.newWorkflow();
              },
              err => {
                this.setInProgress(false);
                this.errorPopup(err.toString());
              }
            )
          } else {
            let version = this.ptd.currentVersionName;
            // if deleting a version from a definition that has more than 1 version
            this.ptd.removeBpmnInstance(this.ptd.currentVersionName);

            //prepare patch request
            let request = {
              _id: this.ptd._id,
              bpmnInstances: this.ptd.bpmnInstances
            }

            this._testDefinitions.patch(request).subscribe(
              res => {
                this.setVersion();
                this.setInProgress(false);
                this.snackAlert('Version ' + version + ' was deleted');
              },
              err => {
                this.setInProgress(false);
                this.errorPopup(err.toString());
              }
            );
          }
        }
      }
    )
  }


  /*** UTILITY METHODS ***/

  //Looks for the definition supplied in the url, or pulls up default workflow
  async setTestDefinition() {
    return new Promise((resolve, reject) => {
      if (this.qpTestDefinitionId) {
        this._testDefinitions.get(this.qpTestDefinitionId).subscribe(
          result => {
            
            this.ptd = new TestDefinitionElement();
            this.ptd.setAll(result);
            this.setAsSaved(true);
            resolve(this.ptd);
          },
          err => {
            this.errorPopup(err.toString());
            reject(err);
          }
        )
      } else {
        //set new test definition
        this.ptd = new TestDefinitionElement();
        resolve(this.ptd);
      }
    });

  }

  //will set the selected version. If no version is given, the latest will be selected
  async setVersion(version?) {

    //if version not supplied, grab latest
    this.ptd.switchVersion(version);

    this.setBpmn(true);

  }



  async newVersion(options?: NewVersionOptions) {

    if (options && options.versionIndex != null) {

      //create new instance and copy xml
      let instance = this.ptd.newInstance();
      instance.bpmnFileId = this.ptd.bpmnInstances[options.versionIndex].bpmnFileId;
      instance.bpmnXml = this.ptd.bpmnInstances[options.versionIndex].bpmnXml;

      this.ptd.addBpmnInstance(instance);

    } else if ( options && options.fromFile) {
      
      let instance = this.ptd.newInstance();

      instance.bpmnFileId = '0';
      let xml = await new Promise((resolve, reject) => {
        this.fetchFileContents('fileForVersion', xml => {
          resolve(xml);
        });
      });

      instance.bpmnXml = xml as String;

      //set the files process definition key
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(instance.bpmnXml.toString(), "text/xml");
      //set the process definition key in xml
      xmlDoc.getElementsByTagName("bpmn:process")[0].attributes.getNamedItem("id").value = this.ptd.processDefinitionKey as string;
      //save the xml
      instance.bpmnXml = (new XMLSerializer()).serializeToString(xmlDoc);

      this.ptd.addBpmnInstance(instance);

    } else {
      this.ptd.addBpmnInstance();
    }

    this.setVersion();
    this.markFormAs('dirty');
    this.ptd.currentInstance.bpmnHasChanged = true;
  }

  popup() {
    
  }

  async validateFile() {
    return new Promise((resolve, reject) => {

      this.modeler.getBpmnXml().then(xml => {

        this.ptd.currentInstance.bpmnXml = xml.toString();

        this._testDefinitions.validate(this.ptd)
          .subscribe(
            result => {

              if (result['body'].errors && result['body'].errors != {}) {
                this.errorPopup(JSON.stringify(result['body'].errors));
                resolve(false);
              }
              //this.handleResponse(result, false);
              //this.ptd.currentInstance.bpmnHasChanged = true;

              // If any VTH or PFLOs were detected, add to object
              // Update list of test heads
              if (result['body']['bpmnVthTaskIds']) {
                this.ptd.currentInstance.testHeads = result['body'].bpmnVthTaskIds;
                this.ptd.currentInstance.testHeads.forEach((elem, val) => {
                  this.ptd.currentInstance.testHeads[val]['testHeadId'] = elem['testHead']._id;
                  delete this.ptd.currentInstance.testHeads[val]['testHead'];
                })

              }

              //Update plfos list
              if(result['body']['bpmnPfloTaskIds']){
                this.ptd.currentInstance.pflos = result['body'].bpmnPfloTaskIds;
              }

              resolve(true);
            },
            err => {
              reject(false);
            }
          );

      }).catch(err => {
        this.errorPopup(err);
      });

    });

  }

  //returns promise for file object 
  async saveBpmnFile() {
    return new Promise((resolve, reject) => {

      this.modeler.getBpmnXml().then(
        res => {
          this.ptd.currentInstance.bpmnXml = res as String;
          this._testDefinitions.validateSave(this.ptd).subscribe(
            result => {
              resolve(JSON.parse(result.toString())[0]._id);
            },
            err => {
              this.errorPopup(err.toString());
              reject(err);
            }
          )
        }
      )
    });
  }

  async saveDefinition() {

    return new Promise(async (resolve, reject) => {
      
      let fileId = await this.saveBpmnFile();

      if (fileId) {
        this.ptd.currentInstance.bpmnFileId = fileId as String;
      }

      delete this.ptd._id;
      
      this._testDefinitions.create(this.ptd).subscribe(
        res => {
          
          resolve(res);
        },
        err => {
          this.errorPopup(err.message);
          this.setInProgress(false);
          reject(err);
        }
      )
    });

  }

  async updateDefinition() {
    return new Promise(async (resolve, reject) => {

      let versionIndex = this.ptd.currentVersion;

      // set parameters to be sent with the patch
      let request = {
        _id: this.ptd._id,
        testName: this.ptd.testName,
        testDescription: this.ptd.testDescription,
        groupId: this.ptd.groupId
      }

      // If xml has changed, upload file and patch definition details, else just updated details
      if (this.ptd.currentInstance.bpmnHasChanged) {

        //upload file
        let fileId = await this.saveBpmnFile();

        //set file id in the bpmn instance
        if (fileId) {
          this.ptd.currentInstance.bpmnFileId = fileId as String;
        }
      }

      //check if this bpmn version has been saved, else its a new version
      if (this.ptd.currentInstance.createdAt) {
        this.ptd.currentInstance.updatedAt = new Date().toISOString();
        request['bpmnInstances.' + this.ptd.currentVersion] = this.ptd.currentInstance;
      } else {
        this.ptd.currentInstance.createdAt = new Date().toISOString();
        this.ptd.currentInstance.updatedAt = new Date().toISOString();
        request['$push'] = {
          bpmnInstances: this.ptd.currentInstance
        }
      }

      //patch with updated fields
      this._testDefinitions.patch(request).subscribe(res => {
        this.ptd.currentInstance.bpmnHasChanged = false;
        resolve(res);
      },
        err => {
          reject(err);
        });
    });
  }

  markFormAs(mode: 'dirty' | 'pristine') {
    if (mode == 'dirty') {
      this.form.control.markAsDirty();
    } else {
      this.form.control.markAsPristine();
    }
  }


  async checkProcessDefinitionKey() {
    let foundDefinition = null;
    
    this._testDefinitions.check(this.ptd.processDefinitionKey).subscribe(async result => {
      if (result['statusCode'] == 200) {
        this.pStatus = 'unique';
      } else {
        this.pStatus = 'notUnique';
      }
      

      //If process definition key found
      if (result['body'] && result['body'][0]) {

        foundDefinition = result['body'][0];

      } else {
        //seach mongodb for td with pdk
        await new Promise((resolve, reject) => {
          this._testDefinitions.find({
            processDefinitionKey: this.ptd.processDefinitionKey
          }).subscribe(res => {
            
            if (res['total'] > 0) {
              foundDefinition = res['data'][0];
            }
            resolve()
          }, err => {
            reject();
          })
        });
      }
      
      if (foundDefinition) {
        if (this.qpTestDefinitionId != foundDefinition._id) {
          let confirm = this._dialog.open(AlertModalComponent, {
            width: '400px',
            data: {
              type: 'confirmation',
              message: 'The process definition key "' + this.ptd.processDefinitionKey + '" already exists. Would you like to load the test definition, ' + foundDefinition.testName + ' ? This will delete any unsaved work.'
            }
          });

          confirm.afterClosed().subscribe(doChange => {
            if (doChange) {
              this._router.navigate([], {
                queryParams: {
                  testDefinitionId: foundDefinition._id
                }
              })
            } else {
              this.bpmnId.value = '';
            }
          })
        }
      } else {
        let tempPK = this.ptd.processDefinitionKey;
        this.ptd.reset();

        this.ptd.setProcessDefinitionKey(tempPK);

        this.ptd.setId(null);
        this.ptd.setName('');
        this.ptd.setDescription('');
        this.ptd.setGroupId('');
        this.ptd.setVersion(1);
        this.setAsSaved(false);
      }

      if (!this.ptd.currentInstance.version) {
        this.ptd.setNewVersion();
      }

      this.markFormAs('pristine');

      this.ptd.currentInstance.bpmnHasChanged = false;


    });
  }

  setInProgress(mode: Boolean) {
    this.inProgress = mode;
  }

  setAsSaved(mode: Boolean) {
    this.hasBeenSaved = mode;
  }

  /*****************************************
   * BPMN Modeler Functions
   ****************************************/

  async setBpmn(isNewVersion: Boolean, xml?) {

    //If a test definition is loaded set bpmnXml with latest version, else set default flow
    if (xml) {
      this.ptd.currentInstance.bpmnXml = xml;
    } else {
      if (this.ptd._id && this.ptd.currentInstance.bpmnFileId) {
        if (!this.ptd.currentInstance.bpmnXml) {
          this.ptd.currentInstance.bpmnXml = await this.getVersionBpmn() as String;
        }
      } else {
        this.ptd.currentInstance.bpmnXml = await this.getDefaultFlow() as String;

        // If it is a blank new version, set the process definition key in xml
        if (isNewVersion) {
          let parser = new DOMParser();
          //Parse xml
          let xmlDoc = parser.parseFromString(this.ptd.currentInstance.bpmnXml.toString(), "text/xml");
          //set the process definition key in xml
          xmlDoc.getElementsByTagName("bpmn:process")[0].attributes.getNamedItem("id").value = this.ptd.processDefinitionKey as string;
          //save the xml
          this.ptd.currentInstance.bpmnXml = (new XMLSerializer()).serializeToString(xmlDoc);

        }
      }
    }

    await this.modeler.setBpmnXml(this.ptd.currentInstance.bpmnXml);

    //Set bpmn id
    this.bpmnId = (<HTMLInputElement>document.getElementById("camunda-id"));

    if (!isNewVersion) {
      //Set process Definition key
      this.ptd.processDefinitionKey = this.bpmnId.value;

      //Check the process Definition key to get its test definition loaded in.
      
      this.checkProcessDefinitionKey();
    }

    //Listen for any changes made to the diagram and properties panel
    this.modeler.getModel().on('element.changed', (event) => {
      //check to see if process definition key has changed
      if (event.element.type == 'bpmn:Process' && (this.ptd.processDefinitionKey != event.element.id)) {
        this.ptd.processDefinitionKey = event.element.id;
        this.checkProcessDefinitionKey();
      }

      // If it has been deployed, they cannot edit and save it
      if (!this.ptd.currentInstance.isDeployed) {
        this.ptd.currentInstance.bpmnHasChanged = true;
        this.markFormAs('dirty');
      }
    });

    this.setInProgress(false);

  }

  //Open a .bpmn file
  async open() {

    this.setInProgress(true);
    this.ptd.reset();
    this.ptd.switchVersion();

    this.fetchFileContents('file', val => {
      this.setBpmn(false, val);
    });

  }

  //Get the xml of the default bpmn file
  async getDefaultFlow() {
    return new Promise((resolve, reject) => {
      resolve("<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\<bpmn:definitions targetNamespace=\"http:\/\/bpmn.io\/schema\/bpmn\" \>\<bpmn:process id=\"\" isExecutable=\"true\"\>\<bpmn:startEvent id=\"StartEvent_1\" /\>\</bpmn:process\>\<bpmndi:BPMNDiagram id=\"BPMNDiagram_1\"\>\<bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1ai7kus\"\>\<bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\"\>\<dc:Bounds x=\"179\" y=\"159\" width=\"36\" height=\"36\" /\>\</bpmndi:BPMNShape\>\</bpmndi:BPMNPlane\>\</bpmndi:BPMNDiagram\>\</bpmn:definitions\>")
      // this._fileTransfer.get('5d0a5357e6624a3ef0d16164').subscribe(
      //   data => {
      //     let bpmn = new Buffer(data as Buffer);
      //     resolve(bpmn.toString());
      //   },
      //   err => {
      //     this.errorPopup(err.toString());
      //     reject(err);
      //   }
      // );
    });
  }

  //set the Modeler
  async setModeler(options) {
    if (!this.modeler) {
      this.modeler = await this._bpmnFactory.setup(options);
    }
  }

  async getVersionBpmn() {
    return new Promise((resolve, reject) => {
      this._fileTransfer.get(this.ptd.currentInstance.bpmnFileId).subscribe(
        result => {
          let bpmn = new Buffer(result as Buffer);
          console.log(bpmn.toString())
          resolve(bpmn.toString());
        },
        err => {
          this.errorPopup(err.toString());
          reject(err);
        }
      );
    });
  }

  fetchFileContents(elementId, callback) {
    var val = "x";
    var fileToLoad = (document.getElementById(elementId))['files'][0];
    var fileReader = new FileReader();
    if (!fileToLoad) {
      return null;
    }

    fileReader.onload = function (event) {
      val = event.target['result'] as string;
      callback(val);
    }
    fileReader.readAsText(fileToLoad);
  }

  /*****************************************
   * Page Funtionality Methods
   ****************************************/

  toggleSidebar(set: Boolean) {
    if (!set) {
      this.showSidebar = false;
      this.modelerElement.nativeElement.style.right = '0px';
    } else {
      this.showSidebar = true;
      $(this.modelerElement.nativeElement).css('right', $(this.sidebarElement.nativeElement).width());
    }
  }

  toggleProperties() {
    if (!this.showProperties) {
      this.toggleSidebar(true);
      this.showTestDefinition = false;
      this.showProperties = true;
    } else {
      this.toggleSidebar(false);
      this.showProperties = false;
    }
  }

  toggleTestDefinition() {
    if (!this.showTestDefinition) {
      this.toggleSidebar(true);
      this.showProperties = false;
      this.showTestDefinition = true;
    } else {
      this.toggleSidebar(false);
      this.showTestDefinition = false;
    }

    this.refresh();
  }

  refresh() {
    this.isRefreshed = false;
    setTimeout(() => {
      this.isRefreshed = true;
    }, 1);
  }

  snackAlert(msg) {
    this._snack.openFromComponent(AlertSnackbarComponent, {
      duration: 1500,
      data: {
        message: msg
      }
    });
  }

  errorPopup(err) {
    return this._dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        type: 'alert',
        message: err
      }
    });
  }
}

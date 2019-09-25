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


import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListService } from '../../services/list.service';
import { TestHeadService } from '../../services/test-head.service';
import { GroupService } from '../../services/group.service';
import 'codemirror/mode/yaml/yaml.js';
import { MatSnackBar, MatDialog, MatDialogRef } from '@angular/material';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';


@Component({
  selector: 'app-create-test-head-form',
  templateUrl: './create-test-head-form.component.pug',
  styleUrls: ['./create-test-head-form.component.scss']
})
export class CreateTestHeadFormComponent implements OnInit {
  yaml;

  private hasPrevCredential;

  public codeConfig = {
    mode: "yaml",
    theme: "eclipse",
    lineNumbers: true
  };

  @Input() public formData;
  @Input() public options;

  @Output() public childEvent = new EventEmitter();

  //Virtual Test Head Type Options
  types = [
    'Proxy',
    'Regular',
    'Script',
    'Adapter'
  ]

  //Implementation Language Options
  langs = [
    'Java',
    'Python',
    'JavaScript/NodeJS'
  ]

  public vth;
  public groups;

  @ViewChild('testHeadForm') form: any;

  constructor(public dialogRef: MatDialogRef<CreateTestHeadFormComponent>, private http: HttpClient, private list: ListService, private dialog: MatDialog, private snack: MatSnackBar, private testHead: TestHeadService, private group: GroupService) { }

  ngOnInit() {
    this.setNew();
    if(this.formData){
      this.vth = Object.assign({}, this.formData);
      if(!this.vth.authorizationCredential){
          this.vth.authorizationCredential = "";
          this.hasPrevCredential = false;
      }
      else{
          this.hasPrevCredential = true
      }
    }
  }

  markAsDirty(){
    this.form.control.markAsDirty();
  }

  create(){

    this.testHead.create(this.vth)
    .subscribe((vth) => {
      //this.list.addElement('vth', vth);
      this.clear(this.form);
      this.snack.openFromComponent(AlertSnackbarComponent, {
        duration: 1500,
        data: {
          message:'Test Head Created'
        }
      });
      this.dialogRef.close();
      //this.dialog.closeAll();
    }, err => {
      this.dialog.open(AlertModalComponent, {
        data: {
          type: 'alert',
          message: JSON.stringify(err)
        },
        width: '450px'
      })
    });

  }
  //grab file
  saveFileContents(){
    this.getFileContents(val => {
      this.vth.vthInputTemplate = val;
    });
  }

  getFileContents(callback) {
    var val = "x";
    var fileToLoad = (document.getElementById('file'))['files'][0];
    var fileReader = new FileReader();
    if (!fileToLoad) {
      return null;
    }
    fileReader.onload = function (event) {
      //
      val = event.target['result'];

      //
      callback(val);
    }
    fileReader.readAsText(fileToLoad);
  }

  update(){
    if(!this.hasPrevCredential && this.vth.authorizationCredential == ""){
          delete this.vth.authorizationCredential;
    }
    this.testHead.patch(this.vth)
    .subscribe((vth) => {
      // this.list.updateElement('vth', '_id', vth['_id'], vth);
      this.childEvent.emit();
        this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: {
                message:'Test Head Updated'
            }
        });
        this.dialogRef.close();
    });
  }

  clear(form){
    this.setNew();
    if(form){
      form.reset();
    }
    this.childEvent.emit();
  }

  setNew(){
    this.vth = {};
    this.vth.vthInputTemplate = '';

    //this.vth.vthOutputTemplate = '';
  }
}

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


import { Component, OnInit, Inject, Output, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AppGlobals } from 'app/app.global';
import { HttpClient } from '@angular/common/http';
import { TestInstanceService } from '../../services/test-instance.service';
import { TestDefinitionService } from '../../services/test-definition.service';

@Component({
  selector: 'app-test-instance-modal',
  templateUrl: './test-instance-modal.component.pug',
  styleUrls: ['./test-instance-modal.component.scss']
})
export class TestInstanceModalComponent implements OnInit {

  @Output() editInstance;
  public findInstance = true;
  @Input() childEvent;


  constructor(
      public dialogRef: MatDialogRef<TestInstanceModalComponent>,
      private http: HttpClient,
      private testDefintionService: TestDefinitionService,
      private testInstanceService: TestInstanceService,
    @Inject(MAT_DIALOG_DATA) public inputInstanceId) { }

  ngOnInit() {
    if(!this.inputInstanceId){
      this.findInstance = false;
    }
    //if the user is creating an Instance from a test definition page. Pull all data and populate testHeads
    else if(this.inputInstanceId["td"]){
      this.testDefintionService.get(this.inputInstanceId.td,{$populate: ['bpmnInstances.testHeads.testHeadId']}).subscribe((result) => {
        this.editInstance = {
          
          testDefinition: result,
          isEdit: false
        };
        
        this.findInstance = false;
      });

    }
    else if (this.inputInstanceId["ti"]) {
      this.testInstanceService.get(this.inputInstanceId.ti, {$populate: ['testDefinitionId']}).subscribe((result) => {
        
        this.editInstance = {};
        this.editInstance.testInstance = result;
        if(this.inputInstanceId.isEdit){
          this.editInstance.isEdit = true;
        }else{
          this.editInstance.isEdit = false;
        }
        this.findInstance = false;
      });
    }else{
      this.findInstance = false
    }
  }

  close() {
    this.dialogRef.close();
  }
}
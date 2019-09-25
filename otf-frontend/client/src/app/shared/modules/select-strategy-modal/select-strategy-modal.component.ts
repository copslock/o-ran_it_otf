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


import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { TestDefinitionService } from '../../services/test-definition.service';
import { GroupService } from 'app/shared/services/group.service';

@Component({
  selector: 'app-select-strategy-modal',
  templateUrl: './select-strategy-modal.component.pug',
  styleUrls: ['./select-strategy-modal.component.scss']
})
export class SelectStrategyModalComponent implements OnInit  {

  public data; 
  public test_definitions; 
  public search;

  constructor(
    public dialogRef: MatDialogRef<SelectStrategyModalComponent>,
    private testDefinitionService: TestDefinitionService, 
    private _groups: GroupService,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) {
    this.data = {};
   }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.test_definitions = [];
    let groupId = this._groups.getGroup()['_id'];
    
    this.testDefinitionService.find({$limit: -1, groupId: groupId, disabled: { $ne: true }, 'bpmnInstances.isDeployed': true, $populate: ['bpmnInstances.testHeads.testHeadId'] })
      .subscribe(
        (result) => {
            this.test_definitions = result;
        },
        (error) => {
            console.log(error);
      });

    
    this.search = {};
    this.search.testName = ""; 
    this.input_data.testDefinition = {};
  }

}

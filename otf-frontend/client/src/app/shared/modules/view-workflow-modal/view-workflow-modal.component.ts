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


import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TestHeadModalComponent } from '../test-head-modal/test-head-modal.component';
import { BpmnFactoryService } from 'app/shared/factories/bpmn-factory.service';


@Component({
  selector: 'app-view-workflow-modal',
  templateUrl: './view-workflow-modal.component.pug',
  styleUrls: ['./view-workflow-modal.component.scss']
})
export class ViewWorkflowModalComponent implements OnInit {

  public viewer;

  constructor(
    public dialogRef: MatDialogRef<TestHeadModalComponent>, 
    private bpmnFactory: BpmnFactoryService,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) { }

  async ngOnInit() {

    this.viewer = await this.bpmnFactory.setup({
      mode: 'viewer',
      options: {
        container: '#canvas'
      },
      xml: this.input_data.xml,
      fileId: this.input_data.fileId,
      testDefinitionId: this.input_data.testDefinitionId,
      version: this.input_data.version
    });

  }

}

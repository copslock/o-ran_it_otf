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


import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-workflow-request',
  templateUrl: './workflow-request.component.pug',
  styleUrls: ['./workflow-request.component.scss']
})

export class WorkflowRequestComponent implements OnInit {
  @Input() public formData;
  @Input() public taskId;
  @Input() public index;

  @Output() public childEvent = new EventEmitter();

  public workReq;
  constructor() { }

  ngOnInit() {
    this.workReq = this.formData;
  }

  onFormChange(){  
    let event = {
      object: this.workReq,
      taskId: this.taskId,
      index: this.index
    };
    this.childEvent.emit(event);
  }
}

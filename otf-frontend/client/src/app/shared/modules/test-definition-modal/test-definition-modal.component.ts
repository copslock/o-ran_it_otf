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
import { TestDefinitionService } from 'app/shared/services/test-definition.service';

@Component({
  selector: 'app-test-definition-modal',
  templateUrl: './test-definition-modal.component.pug',
  styleUrls: ['./test-definition-modal.component.scss']
})
export class TestDefinitionModalComponent implements OnInit {

  @Output() formData;

  @Input() childEvent;

  constructor(
      public dialogRef: MatDialogRef<TestDefinitionModalComponent>,
      private http: HttpClient,
      private testDefinition: TestDefinitionService,
    @Inject(MAT_DIALOG_DATA) public input_data) { }

  ngOnInit() {
    if (this.input_data.testDefinitionId) {
      this.testDefinition.get(this.input_data.testDefinitionId).subscribe(result => {
        this.formData = result;
      });
    } else {
      this.formData = 'new';
    }
  }

  close() {
    this.dialogRef.close();
  }
}

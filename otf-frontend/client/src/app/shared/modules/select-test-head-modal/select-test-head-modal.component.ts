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


import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TestHeadService } from '../../services/test-head.service';

@Component({
  selector: 'app-select-test-head-modal',
  templateUrl: './select-test-head-modal.component.pug',
  styleUrls: ['./select-test-head-modal.component.scss']
})
export class SelectTestHeadModalComponent implements OnInit {

  public data = {test_heads: []};
  public test_heads;
  public search;
  public selected;

  constructor(public dialogRef: MatDialogRef<SelectTestHeadModalComponent>,
    private testHeadService: TestHeadService,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) { }

  ngOnInit() {
    this.search = {};
    this.input_data.testHead = {};
    this.test_heads = [{}];
    this.testHeadService.find({$limit: -1})
      .subscribe(
        (result) => {
            this.test_heads = result;
        },
        (error) => {
            alert(error.error.message);
      });
    //console.log(this.test_heads)
  }

}

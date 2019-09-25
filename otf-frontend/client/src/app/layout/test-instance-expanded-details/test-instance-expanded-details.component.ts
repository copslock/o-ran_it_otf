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


import { Component, OnInit, Input } from '@angular/core';
import { TestExecutionService } from 'app/shared/services/test-execution.service';

@Component({
  selector: 'app-test-instance-expanded-details',
  templateUrl: './test-instance-expanded-details.component.pug',
  styleUrls: ['./test-instance-expanded-details.component.scss']
})
export class TestInstanceExpandedDetailsComponent implements OnInit {

  @Input() public testInstanceId;
  public executionList:any = [];
  public isLoading = true;

  constructor(private testexecution: TestExecutionService) { }

  ngOnInit() {
    this.testexecution.find({
      $limit: 100, 
      $sort: { 
        startTime: -1 
      }, 
      $or: [
        { "historicTestInstance._id": this.testInstanceId},
        { testInstanceId: this.testInstanceId }
      ],
      $select: ['startTime', 'testResult']
      
    }).subscribe(
      result => {
        for(let i = 0; i < result['data']['length']; i++){
          result['data'][i]['startTime'] = new Date(result['data'][i]['startTime']).toLocaleString();
        }
        this.executionList = result['data'];
        this.isLoading = false;
      }, 
      err => {
        this.isLoading = false;
      }
    );
  }

}

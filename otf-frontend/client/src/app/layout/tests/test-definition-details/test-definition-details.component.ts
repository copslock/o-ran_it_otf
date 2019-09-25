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


import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { TestDefinition } from 'app/shared/models/test-definition.model';
import { StatsService } from 'app/layout/components/stats/stats.service';

@Component({
  selector: 'app-test-definition-details',
  templateUrl: './test-definition-details.component.pug',
  styleUrls: ['./test-definition-details.component.scss']
})
export class TestDefinitionDetailsComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];

  public testDefinition: TestDefinition;
  
  constructor(
    private route: ActivatedRoute, 
    private _testDefinition: TestDefinitionService,
    public stats: StatsService
  ) { }

  ngOnInit() {
    this.toDestroy.push(this.route.params.subscribe(params => {
      
      if(params.id){
        this._testDefinition.get(params.id).subscribe(
          res => {
            
            this.testDefinition = res as TestDefinition;
          },
          err => {
            
          })

        this.getData(params.id);
      }
    }));
  }

  get numOfVersions(){
    if(this.testDefinition['bpmnInstances']){
      return this.testDefinition['bpmnInstances'].length;
    }
    return 0;
  }

  ngOnDestroy() {
    this.toDestroy.forEach(elem => elem.unsubscribe());
  }

  getData(testDefinitionId?){
    if(!testDefinitionId){
      testDefinitionId = this.testDefinition._id
    }

    if(!testDefinitionId){
      return;
    }

    this.stats.getDefaultData(1, {
      'historicTestDefinition._id': testDefinitionId,
      $select: [
        'startTime',
        'endTime',
        "historicTestDefinition._id",
        "historicTestDefinition.testName",
        "historicTestInstance._id",
        "historicTestInstance.testInstanceName",
        "testHeadResults.startTime",
        "testHeadResults.endTime",
        "testHeadResults.testHeadName",
        "testHeadResults.testHeadId",
        "testHeadResults.testHeadGroupId",
        "testHeadResults.statusCode",
        'testResult'
      ],
      $limit: -1,
      $sort: {
        startTime: 1
      },
      startTime: {
        $gte: this.stats.filters.startDate,
        $lte: this.stats.filters.endDate
      }
    });
  }

}

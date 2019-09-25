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


import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TestHead} from "app/shared/models/test-head.model";
import {TestHeadService} from "app/shared/services/test-head.service";
import { Subscription } from 'rxjs';
import { StatsService } from 'app/layout/components/stats/stats.service';


@Component({
  selector: 'app-virtual-test-head-details',
  templateUrl: './virtual-test-head-details.component.pug',
  styleUrls: ['./virtual-test-head-details.component.scss']
})
export class VirtualTestHeadDetailsComponent implements OnInit {

  private toDestroy : Array<Subscription> = [];
  testHead : TestHead;
  public totalExecutions;
  constructor(
    private route: ActivatedRoute, 
    private testHeadService : TestHeadService,
    public stats: StatsService
  ) { }

  ngOnInit() {
    this.toDestroy.push(this.route.params.subscribe(param => {
      if(param.id){
        this.toDestroy.push(this.testHeadService.get(param.id).subscribe(res => {
          this.testHead = res as TestHead;
          
        }, err=>{
          console.log(err);
        }));

        this.getData(param.id);
      }
    }));
    
  }

  ngOnDestroy(){
    this.toDestroy.forEach(e => {
      e.unsubscribe()
    });
  }

  getData(testHeadId?){
    if(!testHeadId){
      testHeadId = this.testHead._id
    }

    if(!testHeadId){
      return;
    }

    this.stats.getDefaultData(1, {
      'testHeadResults.testHeadId': testHeadId,
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


  setTotalExecutions(event){
    this.totalExecutions = event;
  }
}

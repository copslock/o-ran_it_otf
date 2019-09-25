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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

import { StatsService } from '../stats.service';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { TestInstanceService } from 'app/shared/services/test-instance.service';
import { GroupService } from 'app/shared/services/group.service';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.pug',
  styleUrls: ['./filter-modal.component.scss']
})

export class FilterModalComponent implements OnInit {

  public group;
  public allFilters = {
    startDate: "",
    endDate: ""
  };
  public tdFilters = {
    selected: [],
    startDate: "",
    endDate: "",
  };
  public tiFilters = {
    selectedTDs: [],
    selectedTIs: [],
    startDate: "",
    endDate: "",
    multiLineLimit: 5
  };
  public scheduleFilters = {
    startDate: "",
    endDate: "",
    timeRangeStart: "",
    timeRangeEnd: "",
    selectedInstances: [],
  }
  // public vthFilters = {
  //   selected: [],
  //   startDate: "",
  //   endDate: "",
  // };

  public minDate;
  public maxDate;

  public testDefinitions: Array<any> = [];
  public testInstances: Array<any> = [];
  //public scheduleInstances: Array<any> = [];
  //public vths = [];

  constructor(
    public dialogRef: MatDialogRef<FilterModalComponent>,
    public statsService: StatsService,
    public tdService: TestDefinitionService,
    public groupService: GroupService,
    public tiService: TestInstanceService
  ) {
    this.minDate = new Date(moment().subtract(1, 'year').format('L'));
    this.maxDate = new Date(moment().format('L'));

  }

  ngOnInit() {
    //populate the td, ti, and vth arrays up there. or import them?
    this.setTDList();
    this.setTIList();
  }

  setTDList() {
    this.tdService.find({
      groupId: this.groupService.getGroup()["_id"],
      $select: ['testName', 'testDescription', "_id"],
      $limit: -1,
      $sort:{
        testName:1
      }
    }).subscribe(result => {
      for (let index in result) {
        this.testDefinitions.push({id: result[index]._id, viewValue: result[index].testName });
      }
    })
  }

  setTIList() {
    this.tiService.find({
      groupId: this.groupService.getGroup()["_id"],
      $select: ['testInstanceName', 'testInstanceDescription', "_id"],
      $limit: -1,
      $sort:{
        testInstanceName:1
      }
    }).subscribe(result => {
      //console.log(result);
      for (let index in result) {
        this.testInstances.push({ id: result[index]._id, viewValue: result[index].testInstanceName })
      }
      //this.testInstances.sort((a, b) => b.viewValue - a.viewValue);
    })
  }

  checkDates() {
    let allSet = true;

    if (this.scheduleFilters.startDate > this.scheduleFilters.endDate) {
      allSet = false;
      alert("Schedule Filters: Your end date cannot be earlier than your start date.");
    } else if (this.tdFilters.startDate > this.tdFilters.endDate) {
      allSet = false;
      alert("Test Definition Filters: Your end date cannot be earlier than your start date.");
    } else if (this.tiFilters.startDate > this.tiFilters.endDate) {
      allSet = false;
      alert("Test Instance Filters: Your end date cannot be earlier than your start date.");
    }
    return allSet;
  }

  onConfirm() {
    if (this.checkDates() == true) {
      this.close();
      this.statsService.filterData(this.allFilters, this.tdFilters, this.tiFilters, this.scheduleFilters);
      //console.log(this.tdFilters);
    }
  }

  close() {
    this.dialogRef.close();
  }

}

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


import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
//import material from "@amcharts/amcharts4/themes/material";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { GroupService } from 'app/shared/services/group.service';
import { StatsService } from '../stats.service';
import { Observable, Subject } from 'rxjs';

export interface ScheduleElement {
  name: string;
  dateExec: string;
  timeExec: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.pug',
  styleUrls: ['./schedule.component.scss']
})

export class ScheduleComponent implements OnInit {

  protected stats: StatsService;
  public doneLoadingfalse;
  public dataSource;

  displayedColumns: string[] = ['name', 'dateExec', 'timeExec'];

  constructor(private zone: NgZone, private _groups: GroupService, private statsService: StatsService, private changeDetector: ChangeDetectorRef) {
    this.stats = statsService;
  }

  ngOnInit() {

    this.stats.onDefaultDataCallFinished().subscribe(res => {
      this.dataSource = this.stats.getData("Schedule");
    })
    this.dataSource = this.stats.getData("Schedule");

    this.refresh();
  }

  defaultDataListener(): Observable<Object> {
    return this.stats.finishedDefaultData;
  }

  refresh(){
    this.stats.onScheduleChangeFinished().subscribe(res => {
      this.dataSource = this.stats.getData("Schedule");
      this.dataSource = this.dataSource.slice();
      
      this.changeDetector.detectChanges();
    })
  }

}
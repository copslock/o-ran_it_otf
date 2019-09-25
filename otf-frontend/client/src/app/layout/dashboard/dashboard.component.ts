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


import { Component, OnInit, ViewChild, HostListener, EventEmitter, OnDestroy } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { MatPaginator, MatDialog } from '@angular/material';
import { ListService } from 'app/shared/services/list.service';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { SchedulingService } from 'app/shared/services/scheduling.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { UserService } from 'app/shared/services/user.service';
import { FeathersService } from 'app/shared/services/feathers.service';
import { GroupService } from 'app/shared/services/group.service';
import { FilterModalComponent } from '../components/stats/filter-modal/filter-modal.component';
import { StatsService } from '../components/stats/stats.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.pug',
  styleUrls: ['./dashboard.component.scss'],
  animations: [routerTransition()]
})

export class DashboardComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];

  // Top of the page stats
  public topStats = {
    COMPLETED: 0,
    UNKNOWN: 0,
    FAILURE: 0,
    STOPPED: 0,
    UNAUTHORIZED: 0,
    FAILED: 0
  };

  public testDefinitionList = null;
  public testExecutions;
  public displayedColumns = ['name', 'result', 'startTime'];
  public displayedScheduleColumns = ['name', 'nextRun'];
  public weekExecutions = 0;
  public weekSchedules = 0;
  public filter = { testResult: '' }; // for dropdown in html
  public group;

  public eventsSubject: Subject<void>;

  public TD_selectedTDs = "All";
  public TI_selectedTDs = "All";
  public TI_selectedTIs = "Top 5";
  public sched_selectedTIs = "All";

  public viewers = [];

  @ViewChild(MatPaginator) executionsPaginator: MatPaginator;
  @ViewChild(MatPaginator) scheduledPaginator: MatPaginator;

  constructor(
    private _groups: GroupService,
    private filterModal: MatDialog, 
    private stats: StatsService
  ) { }

  async ngOnInit() {

    this.stats.getDefaultData(this._groups.getGroup());
    this.toDestroy.push(this._groups.groupChange().subscribe(group => {
      this.stats.getDefaultData(group);
    }));

    //this.resetData();

  //   this.stats.onTDExecutionChangeFinished().subscribe(res => {
  //     this.TD_selectedTDs = "";
  //     this.stats.getTDFilters().selected.forEach(item => {
  //       this.TD_selectedTDs += (item.viewValue + ", ");
  //     })
  //     let charLimit = 200;
  //     if (this.TD_selectedTDs.length > charLimit) {
  //       this.TD_selectedTDs = this.TD_selectedTDs.slice(0, charLimit) + "...";
  //     } else this.TD_selectedTDs = this.TD_selectedTDs.slice(0, this.TD_selectedTDs.length - 2);
  //   })

  //   this.stats.onTIExecutionChangeFinished().subscribe(res => {
  //     let selectedTIs = this.stats.getTIFilters().selectedTIs;
  //     let selectedTDs = this.stats.getTIFilters().selectedTDs;

  //     if (selectedTIs.length == 0) this.TI_selectedTIs = "All";
  //     else {
  //       this.TI_selectedTIs = "";
  //       this.stats.getTIFilters().selectedTIs.forEach(item => {
  //         this.TI_selectedTIs += (item + ", ");
  //       })
  //       let charLimit = 200;
  //       if (this.TI_selectedTIs.length > charLimit) {
  //         this.TI_selectedTIs = this.TI_selectedTIs.slice(0, charLimit) + "...";
  //       } else this.TI_selectedTIs = this.TI_selectedTIs.slice(0, this.TI_selectedTIs.length - 2);
  //     }

  //     if (selectedTDs.length == 0) this.TI_selectedTDs = "All";
  //     else {
  //       this.TI_selectedTDs = "";
  //       this.stats.getTIFilters().selectedTDs.forEach(item => {
  //         this.TI_selectedTDs += (item + ", ");
  //       })
  //       let charLimit = 200;
  //       if (this.TI_selectedTDs.length > charLimit) {
  //         this.TI_selectedTDs = this.TI_selectedTDs.slice(0, charLimit) + "...";
  //       } else this.TI_selectedTDs = this.TI_selectedTDs.slice(0, this.TI_selectedTDs.length - 2);
  //     }
  //   })

  //   this.stats.onScheduleChangeFinished().subscribe(res => {
  //     let selectedTIs = this.stats.scheduledTests.map(el => el.name);
  //     //console.log(selectedTIs);
  //     if (selectedTIs.length == 0) this.sched_selectedTIs = "All";
  //     else {
  //       this.sched_selectedTIs = "";
  //       this.stats.scheduledTests.map(el => el.name).forEach(item => {
  //         this.sched_selectedTIs += (item + ", ");
  //       })
  //       let charLimit = 200;
  //       if (this.sched_selectedTIs.length > charLimit) {
  //         this.sched_selectedTIs = this.sched_selectedTIs.slice(0, charLimit) + "...";
  //       } else this.sched_selectedTIs = this.sched_selectedTIs.slice(0, this.sched_selectedTIs.length - 2);
  //     }
  //   })
  }

  ngOnDestroy(){
    this.toDestroy.forEach(elem => {
      elem.unsubscribe();
    });
  }

  openFilterModal() {
    let open = this.filterModal.open(FilterModalComponent, {
      width: '50%',
      height: '60%',
      disableClose: true
    })

    open.afterClosed().subscribe(res => {
      this.ngOnInit();
    })
  }

  resetData() {
    //console.log("resetting");
    this.TD_selectedTDs = "All";
    this.TI_selectedTDs = "All";
    this.TI_selectedTIs = "Top 5";
    this.sched_selectedTIs = "All";
    this.stats.getDefaultData(this._groups.getGroup());
  }

}


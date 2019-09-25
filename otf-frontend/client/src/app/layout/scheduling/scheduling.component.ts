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


import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routerLeftTransition } from '../../router.animations';
import { ListService } from '../../shared/services/list.service';
import { Router } from '@angular/router';
import { MatDialog, MatTableDataSource, MatPaginator, MatSnackBar } from '@angular/material';
import { ScheduleTestModalComponent } from '../../shared/modules/schedule-test-modal/schedule-test-modal.component';
import { SchedulingService } from '../../shared/services/scheduling.service';
import { TestInstanceService } from '../../shared/services/test-instance.service';
import { AlertModalComponent } from '../../shared/modules/alert-modal/alert-modal.component';
import { ViewScheduleModalComponent } from '../../shared/modules/view-schedule-modal/view-schedule-modal.component';
import { AlertSnackbarComponent } from '../../shared/modules/alert-snackbar/alert-snackbar.component';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.pug',
  styleUrls: ['./scheduling.component.scss'],
  animations: [routerLeftTransition()]
})

export class SchedulingComponent implements OnInit {

  constructor(private http: HttpClient,
    private router: Router,
    private viewRef: ViewContainerRef,
    private list: ListService,
    private schedulingService: SchedulingService,
    private testInstanceService: TestInstanceService,
    public dialog: MatDialog,
    private snack: MatSnackBar
    ) { }

  public search;
  public data;
  public dataSource;
  public displayedColumns: string[] = ['name', 'description', 'testDefinition', 'options'];
  public resultsLength;
  public instances;
  public temp;
  public count;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.search = {};
    this.search._id = "";
    this.search.testInstanceName = "";
    this.instances = [];
    this.list.createList('schedules');
    this.temp = {};
    this.count = 0;

    this.schedulingService.find({$limit: -1, 'data.testSchedule._testInstanceStartDate': { $ne: ['now'] }}).subscribe((list) => {
      
        for(var i = 0; i < Object.keys(list).length; i++){
          list[i].nextRunAt = this.convertDate(list[i].nextRunAt);
          list[i].lastRunAt = this.convertDate(list[i].lastRunAt);
        }
        this.list.changeMessage('schedules', list);
    })

    
    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;
    
    this.list.listMap['schedules'].currentList.subscribe((list) =>{
      if(list){
        this.dataSource.data = list;
        this.resultsLength = list.length;
        
       
      }
    });
  }

  convertDate(str){
    if(!str){
      return 'none'
    }
    str = str.split('-')
    let dayAndTime = str[2];
    let day = dayAndTime.substring(0, dayAndTime.indexOf('T'));
    let time = dayAndTime.substring(dayAndTime.indexOf('T')+1, dayAndTime.length-5);
    return  str[1] + '/' + day + '/' + str[0] + ' at ' + time + ' UTC';
  }

  viewSchedule(sched){
    this.dialog.open(ViewScheduleModalComponent, {
      width: '450px',
      data: sched
    });

  }

  deleteSchedule(sched){
    const dialogRef = this.dialog.open(AlertModalComponent, {
      width : '450px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to delete you schedule? This action cannot be undone.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.schedulingService.delete(sched._id).subscribe((result) => {
          this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: { 
              message:'Test Instance Saved'
            }
          });
          this.list.removeElement('sched', '_id', sched._id + '');
          this.list.listMap['sched'].currentList.subscribe(x => {
              this.dataSource = x;
          });

        })
      }
    })
    
  }

  createSchedule(){
    const dialogRef = this.dialog.open(ScheduleTestModalComponent, {
      width: '90%'
    });

    dialogRef.afterClosed().subscribe(result => {
      /*if(result != ''){
        this.test_instance_selected = result;
        this.strategy_selected = true;
      }else{
        this.strategy_selected = false;
      }*/
    });
  }

}

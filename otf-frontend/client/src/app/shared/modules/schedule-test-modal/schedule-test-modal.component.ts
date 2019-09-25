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


import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { TestInstanceService } from '../../services/test-instance.service';
import { SchedulingService } from '../../services/scheduling.service';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';


@Component({
  selector: 'app-schedule-test-modal',
  templateUrl: './schedule-test-modal.component.pug',
  styleUrls: ['./schedule-test-modal.component.scss']
})
export class ScheduleTestModalComponent implements OnInit {

  public data;
  public test_instances;
  public selectedTestInstance;
  public schedule;
  public search;
  public timeUnit;
  public timeToRun;
  public numUnit;
  public startDate;
  public endDate;
  public frequency = false;
  public isSelected = false;
  public scheduledJobs;
  public loadingJobs;

  constructor(
    private schedulingService: SchedulingService,
    private testInstanceService: TestInstanceService,
    public dialogRef: MatDialogRef<ScheduleTestModalComponent>,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.timeUnit = 60;
    this.numUnit = 0;
    this.search = {};
    this.selectedTestInstance = {};
    this.startDate = null;
    this.timeToRun = null;
    this.endDate = null;
    //this.search.testInstanceName = ""; 
    //this.test_instances = [];
    this.schedule = {};
    this.schedule.testInstanceExecFreqInSeconds = '';
    this.scheduledJobs = [];
    this.loadingJobs = true;

    //console.log(this.test_instances);
    this.testInstanceService.get(this.input_data.id).subscribe(
      result => {
        this.selectedTestInstance = result;
      }
    );

    this.schedulingService.find({$limit: -1, testInstanceId: this.input_data.id}).subscribe(
      result => {
        for (let i = 0; i < result['length']; i++) {
          result[i].data.testSchedule._testInstanceStartDate = new Date(result[i].data.testSchedule._testInstanceStartDate).toLocaleString();
          if (result[i].data.testSchedule._testInstanceEndDate) {
            result[i].data.testSchedule._testInstanceEndDate = new Date(result[i].data.testSchedule._testInstanceEndDate).toLocaleString();
          }
          this.scheduledJobs.push(result[i]);

        }
        this.loadingJobs = false;
      }
    );
  }

  convertDate(date, time = ''): Date {
    let nDate = new Date(date + '');
    return new Date(nDate.getMonth() + 1 + '/' + nDate.getDate() + '/' + nDate.getFullYear() + ' ' + time);
  }

  createSchedule() {
    this.convertDate(this.startDate, this.timeToRun);

    if (!this.selectedTestInstance || !this.startDate || !this.timeToRun) {
      this.dialog.open(AlertModalComponent, {
        width: '450px',
        data: {
          type: 'Alert',
          message: 'Select start date/time before you create schedule!'
        }
      });
      return;
    }
    if (this.frequency) {
      this.schedule = {
        testInstanceId: this.selectedTestInstance._id,
        testInstanceStartDate: this.convertDate(this.startDate, this.timeToRun).toISOString(),
        testInstanceExecFreqInSeconds: this.numUnit * this.timeUnit,
        async: false,
        asyncTopic: ''
      };
      

      if(this.endDate){
        this.schedule.testInstanceEndDate = this.convertDate(this.endDate).toISOString();
      }
    } else {
      this.schedule = {
        testInstanceId: this.selectedTestInstance._id,
        testInstanceStartDate: this.convertDate(this.startDate, this.timeToRun).toISOString(),
        async: false,
        asyncTopic: ''
      };
      //console.log(this.schedule);
      
    }

    this.schedulingService.create(this.schedule).subscribe((result) => {
      this.snack.openFromComponent(AlertSnackbarComponent, {
        duration: 1500,
        data: {
          message: 'Schedule Created!'
        }
      });
      this.ngOnInit();
    }, err => {
      this.dialog.open(AlertModalComponent, {
        data: {
          type: "alert", 
          message: err.message
        }
      })
    })
    // console.log(this.schedule);
  }

  deleteJob(job) {
    var deleteJob = this.dialog.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to delete this schedule?'
      }
    });

    deleteJob.afterClosed().subscribe(
      result => {
        if (result) {
          this.schedulingService.delete(job._id).subscribe(
            result => {
              this.ngOnInit();
            }
          );
        }
      }
    );
  }
  // this.testInstanceId = testInstanceId;
  // this.testInstanceStartDate = testInstanceStartDate;
  // this.testInstanceExecFreqInSeconds = testInstanceExecFreqInSeconds;
  // this.testInstanceEndDate = testInstanceEndDate;
  // this.async = async;
  // this.asyncTopic = asyncTopic;
  // this.executorId = executorId;


}

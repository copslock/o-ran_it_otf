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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-view-schedule-modal',
  templateUrl: './view-schedule-modal.component.pug',
  styleUrls: ['./view-schedule-modal.component.scss']
})
export class ViewScheduleModalComponent implements OnInit  {
  
  public data; 

  constructor( 
    private dialogRef: MatDialogRef<ViewScheduleModalComponent>, 
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public schedule: any
  ) {
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if(!this.schedule.data.testSchedule._testInstanceEndDate){
      this.schedule.data.testSchedule._testInstanceEndDate = 'none';
    }
  }
}

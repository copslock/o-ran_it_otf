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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulingRoutingModule } from './scheduling-routing.module'
import { SchedulingComponent } from './scheduling.component';
import { PageHeaderModule } from '../../shared/modules';
import { MatButtonModule, MatIconModule, MatDatepickerModule, MatCheckboxModule, MatTableModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSnackBarModule} from '@angular/material';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { ScheduleTestModalModule } from '../../shared/modules/schedule-test-modal/schedule-test-modal.module';
import { AlertModalModule } from '../../shared/modules/alert-modal/alert-modal.module';
import { ViewScheduleModalModule } from '../../shared/modules/view-schedule-modal/view-schedule-modal.module';


@NgModule({
  imports: [
    CommonModule,
    SchedulingRoutingModule,
    ViewScheduleModalModule,
    AlertModalModule,
    MatTableModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatPaginatorModule,
    FilterPipeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    PageHeaderModule,
    MatSnackBarModule,
    ScheduleTestModalModule
  ],
  declarations: [SchedulingComponent]
})
export class SchedulingModule {
}

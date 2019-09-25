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
//needed imports for Material Dialogue
import { MatDialogModule, MatRadioModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatSelectModule, MatSnackBarModule, MatSlideToggleModule, MatProgressSpinnerModule} from '@angular/material';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule } from '@angular/forms';
import { ScheduleTestModalComponent } from './schedule-test-modal.component';
import { AlertSnackbarModule } from '../alert-snackbar/alert-snackbar.module';
import { AlertModalModule } from '../alert-modal/alert-modal.module';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FilterPipeModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatDialogModule,
    MatDatepickerModule,
    MatSnackBarModule,
    AlertSnackbarModule,
    AlertModalModule,
    MatSnackBarModule,
    MatSelectModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    NgxMaterialTimepickerModule.forRoot(),
    MatFormFieldModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  declarations: [ScheduleTestModalComponent ],
  exports: [ScheduleTestModalComponent],
  entryComponents: [ScheduleTestModalComponent]
})
export class ScheduleTestModalModule { }

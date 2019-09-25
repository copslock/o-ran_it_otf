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
import { CreateTestFormComponent } from './create-test-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatTooltipModule, MatInputModule, MatBadgeModule, MatOptionModule, MatSelectModule,
    MatSnackBarModule, 
    MatSlideToggleModule,
    MatListModule} from '@angular/material';
import { MatProgressButtonsModule} from 'mat-progress-buttons';
import { PageHeaderModule } from '../page-header/page-header.module';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { SelectStrategyModalModule } from '../select-strategy-modal/select-strategy-modal.module';
import { SelectTestHeadModalModule } from '../select-test-head-modal/select-test-head-modal.module';
import { CodemirrorModule } from 'ng2-codemirror';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertModalModule } from '../alert-modal/alert-modal.module';
import { AlertSnackbarModule } from '../alert-snackbar/alert-snackbar.module';
import { FileUploadModule } from 'ng2-file-upload';
import { Bpmn } from 'app/shared/models/bpmn.model';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollY: true
};

@NgModule({
  imports: [
    CommonModule,
    FilterPipeModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderModule,
    PerfectScrollbarModule,
    MatButtonModule,
    SelectTestHeadModalModule,
    SelectStrategyModalModule,
    MatIconModule,
    CodemirrorModule,
    MatTooltipModule,
    MatInputModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    AlertModalModule,
    MatSelectModule,
    MatOptionModule,
    AlertSnackbarModule,
    MatSnackBarModule,
    FileUploadModule,
    MatSlideToggleModule,
    MatProgressButtonsModule,
    MatListModule
  ],
  declarations: [CreateTestFormComponent],
  exports: [CreateTestFormComponent],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
  ]
})
export class CreateTestFormModule { }

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

import { CreateTestRoutingModule } from './create-test-routing.module';
import { CreateTestComponent } from './create-test.component';
import { PageHeaderModule } from '../../../shared';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MAT_CHECKBOX_CLICK_ACTION, MatCardModule } from '@angular/material';
import { CreateTestFormModule } from '../../../shared/modules/create-test-form/create-test-form.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollY: true
};

@NgModule({
  imports: [
    CommonModule,
    CreateTestRoutingModule,
    CreateTestFormModule,
    PageHeaderModule,
    FilterPipeModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatInputModule,
    MatIconModule,
    CreateTestFormModule,
    MatCardModule
  ],
  declarations: [CreateTestComponent],
  providers: [
    {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}},
    {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check'}
  ]
})
export class CreateTestModule { }

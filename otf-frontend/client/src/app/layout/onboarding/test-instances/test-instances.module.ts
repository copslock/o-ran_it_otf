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

import { TestInstancesRoutingModule } from './test-instances-routing.module';
import { TestInstancesComponent } from './test-instances.component';
import { PageHeaderModule } from '../../../shared';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatInputModule, MatIconModule, MatExpansionModule, MatCardModule } from '@angular/material';
import { CreateTestFormModule } from '../../../shared/modules/create-test-form/create-test-form.module';
import { CodemirrorModule } from 'ng2-codemirror';
import { CreateTestInstanceFormModule } from '../../../shared/modules/create-test-instance-form/create-test-instance-form.module';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    TestInstancesRoutingModule,
    FilterPipeModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatInputModule,
    MatIconModule,
    MatExpansionModule,
    CodemirrorModule,
    MatCardModule,
    CreateTestInstanceFormModule
  ],
  declarations: [TestInstancesComponent]
})
export class TestInstancesModule { }

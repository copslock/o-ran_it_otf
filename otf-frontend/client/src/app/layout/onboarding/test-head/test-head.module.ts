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


import { NgModule, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestHeadRoutingModule } from './test-head-routing.module';
import { TestHeadComponent } from './test-head.component';
import { PageHeaderModule, SharedPipesModule } from '../../../shared';
import { FormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { ListService } from '../../../shared/services/list.service';
import { CreateTestHeadFormModule } from '../../../shared/modules/create-test-head-form/create-test-head-form.module';
import { CreateTestHeadFormComponent } from '../../../shared/modules/create-test-head-form/create-test-head-form.component';
import { TestHeadModalModule } from '../../../shared/modules/test-head-modal/test-head-modal.module';
import { MatButtonModule, MatCardModule } from '@angular/material';

//import { CreateTestHeadFormComponent } from '../../../shared/modules/create-test-head-form/create-test-head-form.component';

@NgModule({
  imports: [
    CommonModule,
    TestHeadRoutingModule,
    CreateTestHeadFormModule,
    PageHeaderModule,
    FormsModule,
    FilterPipeModule,
    TestHeadModalModule,
    MatButtonModule,
    MatCardModule
  ],
  declarations: [
    TestHeadComponent
  ]

})

export class TestHeadModule { }

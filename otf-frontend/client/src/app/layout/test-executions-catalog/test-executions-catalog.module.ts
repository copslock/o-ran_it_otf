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


import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TestExecutionsCatalogRoutingModule} from './test-executions-catalog-routing.module';
import {TestExecutionsCatalogComponent} from './test-executions-catalog.component';
import {PageHeaderModule} from 'app/shared';
import {FormsModule} from '@angular/forms';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
} from '@angular/material';
import {TestHeadModalModule} from 'app/shared/modules/test-head-modal/test-head-modal.module';
import {AlertModalModule} from 'app/shared/modules/alert-modal/alert-modal.module';

@NgModule({
    imports: [
        CommonModule,
        TestExecutionsCatalogRoutingModule,
        PageHeaderModule,
        FormsModule,
        FilterPipeModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        TestHeadModalModule,
        AlertModalModule,
        MatIconModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    declarations: [TestExecutionsCatalogComponent]
})
export class TestExecutionsCatalogModule {
}

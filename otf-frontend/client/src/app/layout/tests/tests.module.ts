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
import {TestsRoutingModule} from './tests-routing.module';
import {TestsComponent} from './tests.component';
import {
    MAT_DIALOG_DATA,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule
} from '@angular/material';
import {PageHeaderModule} from '../../shared';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FormsModule} from '@angular/forms';
import {TestHeadModalModule} from '../../shared/modules/test-head-modal/test-head-modal.module';
import {AlertModalModule} from '../../shared/modules/alert-modal/alert-modal.module';
import {TestDefinitionModalModule} from 'app/shared/modules/test-definition-modal/test-definition-modal.module';
import {CreateTestModule} from '../onboarding/create-test/create-test.module';
import {ViewWorkflowModalModule} from 'app/shared/modules/view-workflow-modal/view-workflow-modal.module';
import { CreateTestInstanceFormModule } from '../../shared/modules/create-test-instance-form/create-test-instance-form.module';
import { TestInstanceModalModule } from '../../shared/modules/test-instance-modal/test-instance-modal.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';
import { TestDefinitionDetailsComponent } from './test-definition-details/test-definition-details.component';
import {MatCardModule} from '@angular/material/card';
import { DashboardModule } from '../dashboard/dashboard.module';

@NgModule({
    imports: [
        CommonModule,
        TestsRoutingModule,
        PageHeaderModule,
        FormsModule,
        FilterPipeModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        TestHeadModalModule,
        TestInstanceModalModule,
        AlertModalModule,
        TestDefinitionModalModule,
        CreateTestModule,
        TestDefinitionModalModule,
        MatTooltipModule,
        ViewWorkflowModalModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        NgbModule,
        AgGridModule.withComponents([]),
        MatIconModule,
        MatCardModule,
        DashboardModule,
        MatDatepickerModule
    ],
    declarations: [TestsComponent, TestDefinitionDetailsComponent],
    providers: [{provide: MAT_DIALOG_DATA, useValue: {}}]
})
export class TestsModule {
}

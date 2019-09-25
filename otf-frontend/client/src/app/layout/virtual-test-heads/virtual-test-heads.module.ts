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

import {VirtualTestHeadsRoutingModule} from './virtual-test-heads-routing.module';
import {VirtualTestHeadsComponent} from './virtual-test-heads.component';
import {PageHeaderModule} from '../../shared';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FormsModule} from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule
} from '@angular/material';
import {CreateTestHeadFormModule} from '../../shared/modules/create-test-head-form/create-test-head-form.module';
import {MatTableModule} from '@angular/material/table';
import {TestHeadModalModule} from '../../shared/modules/test-head-modal/test-head-modal.module';
import {AlertModalModule} from '../../shared/modules/alert-modal/alert-modal.module';
import {AlertSnackbarModule} from 'app/shared/modules/alert-snackbar/alert-snackbar.module';
import { VirtualTestHeadDetailsComponent } from './virtual-test-head-details/virtual-test-head-details.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import { LineChartComponent } from '../components/stats/line-chart/line-chart.component';
import { DashboardModule } from '../dashboard/dashboard.module';
import { TestHeadExecutionsLineChartComponent } from './virtual-test-head-details/charts/test-head-executions-line-chart/test-head-executions-line-chart.component';

@NgModule({
    imports: [
        CommonModule,
        VirtualTestHeadsRoutingModule,
        PageHeaderModule,
        FormsModule,
        FilterPipeModule,
        CreateTestHeadFormModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        TestHeadModalModule,
        AlertModalModule,
        MatSnackBarModule,
        AlertSnackbarModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule
    ],
    declarations: [VirtualTestHeadsComponent, VirtualTestHeadDetailsComponent, TestHeadExecutionsLineChartComponent],
    entryComponents: [],
    providers: [{provide: MAT_DIALOG_DATA, useValue: {}}, MatDatepickerModule]
})
export class VirtualTestHeadsModule {
}

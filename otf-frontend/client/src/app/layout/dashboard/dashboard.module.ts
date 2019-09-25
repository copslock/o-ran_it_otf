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


import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';

import {
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDialogModule,
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
} from '@angular/material';
import { TestHeadModalModule } from 'app/shared/modules/test-head-modal/test-head-modal.module';
import { AlertModalModule } from 'app/shared/modules/alert-modal/alert-modal.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TestDefinitionExpandedDetailsComponent } from '../test-definition-expanded-details/test-definition-expanded-details.component';
import { ViewWorkflowModalModule } from 'app/shared/modules/view-workflow-modal/view-workflow-modal.module';
import { PieChartComponent } from '../components/stats/pie-chart/pie-chart.component';
import { LineChartComponent } from '../components/stats/line-chart/line-chart.component'
import { ScheduleComponent } from '../components/stats/schedule/schedule.component';;
import { HorizBarChartComponent } from '../components/stats/horiz-bar-chart/horiz-bar-chart.component';
import { FilterModalComponent } from '../components/stats/filter-modal/filter-modal.component';
import { MultiLineChartComponent } from '../components/stats/multi-line-chart/multi-line-chart.component';
import { TestDefinitionExecutionsBarChartComponent } from '../components/stats/test-definition-executions-bar-chart/test-definition-executions-bar-chart.component';
import { TestHeadExecutionsLineChartComponent } from '../components/stats/test-head-executions-line-chart/test-head-executions-line-chart.component';
import { TestHeadExecutionBarChartComponent } from '../components/stats/test-head-execution-bar-chart/test-head-execution-bar-chart.component';

@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        FormsModule,
        FilterPipeModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        TestHeadModalModule,
        AlertModalModule,
        MatBadgeModule,
        PerfectScrollbarModule,
        MatCardModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        NgbModule,
        MatCheckboxModule,
        MatTabsModule,
        ViewWorkflowModalModule,
        MatDialogModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        DashboardComponent,
        TestDefinitionExpandedDetailsComponent,
        LineChartComponent,
        MultiLineChartComponent,
        ScheduleComponent,
        PieChartComponent,
        HorizBarChartComponent,
        FilterModalComponent,
        TestDefinitionExecutionsBarChartComponent,
        TestHeadExecutionsLineChartComponent,
        TestHeadExecutionBarChartComponent
    ],
    entryComponents: [TestDefinitionExpandedDetailsComponent, FilterModalComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [FilterModalComponent, LineChartComponent],
    providers: [{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }, MatDatepickerModule]


})
export class DashboardModule {
}

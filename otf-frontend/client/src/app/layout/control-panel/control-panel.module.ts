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

import { ControlPanelRoutingModule } from './control-panel-routing.module';
import { ControlPanelComponent } from './control-panel.component';
import { FormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatBadgeModule, MatCardModule, MatSelectModule, MatOptionModule, MatIconModule, MatTabsModule, MatListModule, MatDividerModule, MatExpansionModule } from '@angular/material';
import { TestHeadModalModule } from 'app/shared/modules/test-head-modal/test-head-modal.module';
import { AlertModalModule } from 'app/shared/modules/alert-modal/alert-modal.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodemirrorModule } from 'ng2-codemirror';
import { RobotReportComponent } from '../robot-report/robot-report.component';
import { DataTablesModule } from 'angular-datatables';
import { ResizableModule } from 'angular-resizable-element';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
  imports: [
    CommonModule,
    ControlPanelRoutingModule,
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
    CodemirrorModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    DataTablesModule,
    ResizableModule,
    NgxJsonViewerModule
  ],
  declarations: [ControlPanelComponent, RobotReportComponent],
  entryComponents: [RobotReportComponent]
})
export class ControlPanelModule { }

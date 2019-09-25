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
import {TestInstancesCatalogRoutingModule} from './test-instances-catalog-routing.module';
import {TestInstancesCatalogComponent} from './test-instances-catalog.component';
import {AlertModalModule} from '../../shared/modules/alert-modal/alert-modal.module';
import {PageHeaderModule} from '../../shared';
import {FormsModule} from '@angular/forms';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatTableModule, MatSnackBarModule, MatTooltipModule, MatIconModule} from '@angular/material';
import {TestHeadModalModule} from '../../shared/modules/test-head-modal/test-head-modal.module';
import { AlertSnackbarModule } from 'app/shared/modules/alert-snackbar/alert-snackbar.module';
import {TestInstanceModalModule} from '../../shared/modules/test-instance-modal/test-instance-modal.module';
import { ScheduleTestModalModule } from '../../shared/modules/schedule-test-modal/schedule-test-modal.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestInstanceExpandedDetailsComponent } from 'app/layout/test-instance-expanded-details/test-instance-expanded-details.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
    imports: [
        CommonModule,
        TestInstancesCatalogRoutingModule,
        PageHeaderModule,
        ScheduleTestModalModule,
        FormsModule,
        FilterPipeModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        TestHeadModalModule,
        MatSnackBarModule,
        AlertModalModule,
        MatSnackBarModule,
        AlertSnackbarModule,
        TestInstanceModalModule,
        MatTooltipModule,
        MatIconModule,
        NgbModule,
        MatProgressSpinnerModule,
        AgGridModule.withComponents([])
    ],
    declarations: [TestInstancesCatalogComponent,
        TestInstanceExpandedDetailsComponent],
    entryComponents: [TestInstanceExpandedDetailsComponent]
})
export class TestInstancesCatalogModule {
}

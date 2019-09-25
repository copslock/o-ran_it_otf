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
import {UserManagementRoutingModule} from './user-management-routing.module';
import {UserManagementComponent} from './user-management.component';
import {
    MAT_DIALOG_DATA,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatOptionModule,
    MatCheckboxModule,
    MatIconModule
} from '@angular/material';
import {PageHeaderModule} from '../../shared';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FormsModule} from '@angular/forms';
import {AlertModalModule} from '../../shared/modules/alert-modal/alert-modal.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {AlertSnackbarModule} from "../../shared/modules/alert-snackbar/alert-snackbar.module";

@NgModule({
    imports: [
        CommonModule,
        PageHeaderModule,
        FormsModule,
        FilterPipeModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        AlertModalModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressSpinnerModule,
        NgbModule,
        AlertSnackbarModule,
        UserManagementRoutingModule
    ],
    declarations: [UserManagementComponent],
    providers: [{provide: MAT_DIALOG_DATA, useValue: {}}]
})
export class UserManagementModule { }

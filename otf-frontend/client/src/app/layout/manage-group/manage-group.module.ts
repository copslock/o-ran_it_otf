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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageGroupComponent } from './manage-group.component';
import { ManageGroupRoutingModule } from './manage-group-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { UserSelectModule } from 'app/shared/modules/user-select/user-select.module';
import { DropdownMultiselectComponent } from './dropdown-multiselect.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule, MatIconModule, MatCardModule, MatCheckboxModule, MatTableModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatTooltipModule} from '@angular/material';
import { ManageGroupRolesComponent } from './manage-group-roles/manage-group-roles.component';
import {PageHeaderModule} from '../../shared';
import {AlertModalModule} from 'app/shared/modules/alert-modal/alert-modal.module';
import { OnboardMechidModule } from 'app/shared/modules/onboard-mechid/onboard-mechid.module';


@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    ManageGroupRoutingModule,
    AgGridModule.withComponents([DropdownMultiselectComponent]),
    NgbDropdownModule,
    UserSelectModule,
    OnboardMechidModule,
    MatCheckboxModule, 
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    PageHeaderModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    AlertModalModule
  
  ],
  declarations: [ManageGroupComponent, DropdownMultiselectComponent, ManageGroupRolesComponent]
    
  
})
export class ManageGroupModule { }

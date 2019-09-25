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
import { CreateTestInstanceFormComponent } from './create-test-instance-form.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatInputModule, MatIconModule, MatExpansionModule, MatCardModule, MatOptionModule, MatSnackBarModule, MatProgressBar, MatSlideToggleModule, MatSelectModule } from '@angular/material';
import { CodemirrorModule } from 'ng2-codemirror';
import { SelectStrategyModalModule } from '../select-strategy-modal/select-strategy-modal.module';
import { AlertModalModule } from '../alert-modal/alert-modal.module';
import { AlertSnackbarModule } from '../alert-snackbar/alert-snackbar.module';
import { FormGeneratorModule } from '../form-generator/form-generator.module';
import { FileUploadModule } from 'ng2-file-upload';
import { FilterNonDeployedPipe } from './filterNonDeployed.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkflowRequestModule } from '../workflow-request/workflow-request.module';



@NgModule({
  imports: [
    CommonModule,
    AlertModalModule,
    SelectStrategyModalModule,
    PerfectScrollbarModule,
    FilterPipeModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatSnackBarModule,
    AlertSnackbarModule,
    CodemirrorModule,
    FormGeneratorModule,
    FileUploadModule,
    NgbModule,
    WorkflowRequestModule


  ],
  declarations: [CreateTestInstanceFormComponent, FilterNonDeployedPipe],
  exports: [CreateTestInstanceFormComponent]
})
export class CreateTestInstanceFormModule {

 }

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
import { FormGeneratorComponent } from './form-generator.component';
import { MatButtonModule, MatSnackBarModule } from '@angular/material';
import { TextAreaComponent } from './text-area/text-area.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertSnackbarModule } from '../alert-snackbar/alert-snackbar.module';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    AlertSnackbarModule
  ],
  declarations: [ FormGeneratorComponent, TextAreaComponent ],
  exports: [ FormGeneratorComponent ]
})
export class FormGeneratorModule { }

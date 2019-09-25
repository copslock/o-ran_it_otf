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
import { FormsModule } from '@angular/forms';
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import { HttpClientModule } from '@angular/common/http';
import { AppGlobals } from '../app.global';
import { MatDialogModule, MatButtonModule } from '@angular/material';
import { AlertModalModule } from '../shared/modules/alert-modal/alert-modal.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    SignupRoutingModule,
    AlertModalModule
  ],
  declarations: [SignupComponent]
})
export class SignupModule { }

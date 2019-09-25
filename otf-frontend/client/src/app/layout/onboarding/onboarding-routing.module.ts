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
import { Routes, RouterModule } from '@angular/router';
import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
  {
    path: '', component: OnboardingComponent,
    children:[
      { path: '', redirectTo: 'start', pathMatch: 'prefix' },
      { path: 'test-definition', loadChildren: './create-test/create-test.module#CreateTestModule' },
      { path: 'start', loadChildren: './start/start.module#StartModule' },
      { path: 'test-head', loadChildren: './test-head/test-head.module#TestHeadModule' },
      { path: 'test-instances', loadChildren: './test-instances/test-instances.module#TestInstancesModule' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }

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
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {AdminGuard} from "../shared/guard/admin.guard";

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'prefix'},
            {path: 'test-definitions', loadChildren: './tests/tests.module#TestsModule'},
            {path: 'settings', loadChildren: './settings/settings.module#SettingsModule'},
            {path: 'manage-group', loadChildren: './manage-group/manage-group.module#ManageGroupModule'},
            {path: 'feedback', loadChildren: './feedback/feedback.module#FeedbackModule'},
            {path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule'},
            {path: 'scheduling', loadChildren: './scheduling/scheduling.module#SchedulingModule'},
            {path: 'onboarding', loadChildren: './onboarding/onboarding.module#OnboardingModule'},
            {path: 'control-panel', loadChildren: './control-panel/control-panel.module#ControlPanelModule'},
            {path: 'test-heads', loadChildren: './virtual-test-heads/virtual-test-heads.module#VirtualTestHeadsModule'},
            {path: 'test-instances', loadChildren: './test-instances-catalog/test-instances-catalog.module#TestInstancesCatalogModule'},
            {path: 'test-executions', loadChildren: './test-executions-catalog/test-executions-catalog.module#TestExecutionsCatalogModule'},
            {path: 'user-management', loadChildren: './user-management/user-management.module#UserManagementModule', canActivate: [AdminGuard]},
            {path: 'modeler', loadChildren: './modeler/modeler.module#ModelerModule'}
            
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {
}

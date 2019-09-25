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
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { CreateGroupModalModule } from 'app/shared/modules/create-group-modal/create-group-modal.module';
import { MatMenuModule, MatIconModule, MatButtonModule } from '@angular/material';
import { MenuItemComponent } from 'app/shared/components/menu-item/menu-item.component';
@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule.forRoot(),
        CreateGroupModalModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    declarations: [
        LayoutComponent, 
        SidebarComponent,
        HeaderComponent, 
        RightSidebarComponent,
        MenuItemComponent
    ]
})
export class LayoutModule {}

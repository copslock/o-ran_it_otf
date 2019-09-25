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


import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';

import {LayoutComponent} from './layout.component';
import {LayoutModule} from './layout.module';

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                imports: [
                    LayoutModule,
                    RouterTestingModule,
                    TranslateModule.forRoot(),
                ]
            }).compileComponents()
                .then((arg) => {
                    // handle
                })
                .catch((err) => {
                    // handle
                });
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

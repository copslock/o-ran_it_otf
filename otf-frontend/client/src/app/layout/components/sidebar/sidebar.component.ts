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


import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobals } from 'app/app.global';
import {CookieService} from "ngx-cookie-service";
import { HealthService } from 'app/shared/services/health.service';
import { UserService } from 'app/shared/services/user.service';
import { GroupService } from 'app/shared/services/group.service';
import { Group, Groups } from 'app/shared/models/group.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    isActive: boolean = false;
    showMenu: string = '';
    pushRightClass: string = 'push-right';
    version = AppGlobals.version
    tcuapi: boolean;
    tcuengine: boolean;
    isAdmin: boolean = false;

    canManageGroup = false;

    currentGroupId;

    constructor(private translate: TranslateService, public router: Router, public user: UserService, private health: HealthService, private cookie: CookieService, public group: GroupService) {
        this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de/) ? browserLang : 'en');
        this.checkIsAdmin();
        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit(){
        if(this.group.getGroup()){
            this.checkManage(this.group.getGroup());
        }
        this.group.groupChange().subscribe(group => {
            this.checkManage(group);
        })
        this.setHealthStatus();
    }

    checkManage(group){
        this.canManageGroup = this.user.ability.can('management', new Groups(group));
    }

    setHealthStatus(){
        this.health.get('tcu-api').subscribe(res => {
            if(res['code'] == 200 || res['statusCode'] == 200){
                this.tcuapi = true;
            }else{
                this.tcuapi = false;
            }
        }, err => {
            this.tcuapi = false;
        });

        this.health.get('tcu-engine').subscribe(res => {
            
            if(res['code'] == 200 || res['statusCode'] == 200){
                this.tcuengine = true;
            }else{
                this.tcuengine = false;
            }
        }, err => {
            
            this.tcuengine = false;
        });
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }

    checkIsAdmin() {
        if (this.cookie.get('access_token') && this.cookie.get('currentUser')) {
            let currentUser = JSON.parse(this.cookie.get('currentUser'));
            if (currentUser['permissions'].indexOf('admin') >= 0) {
                this.isAdmin = true;
                return true;
            }
        }
        this.isAdmin = false;
        return false;
    }

}

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


import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { GroupService } from 'app/shared/services/group.service';
import { UserService } from 'app/shared/services/user.service';
//import { group } from '@angular/animations';
import { CreateGroupModalComponent } from 'app/shared/modules/create-group-modal/create-group-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NavItem } from 'app/shared/components/menu-item/menu-item.component';
import { MatMenuTrigger } from '@angular/material';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
    pushRightClass: string = 'push-right';
    myStyle: object = {};
    myParams: object = {};
    width: number = 100;
    height: number = 100;

    public groups: Array<NavItem>;
    public selectedGroup;

    @ViewChild('goupMenuTrigger') groupMenu: MatMenuTrigger;
    

    constructor(
        private translate: TranslateService,
        public router: Router,
        private auth: AuthService,
        private cookie: CookieService,
        public _groups: GroupService,
        private user: UserService,
        private modal: MatDialog
        
    ) {

        this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de', 'zh-CHS']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de|zh-CHS/) ? browserLang : 'en');


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
    public currentUser;// = {};
    public username;


    ngOnInit() {
       
       
        this.currentUser = JSON.parse(this.cookie.get('currentUser'));
        this.username = this.currentUser["firstName"] + " " + this.currentUser["lastName"];
        
       

        this._groups.setUp();

        this._groups.listChange().subscribe(res => {
            this.groups = res;
        });
       
        // if (!window.localStorage.getItem("currentGroupId"))
        // {
        //     if (!(this.currentUser.defaultGroup)){
        //         let userPatch = {
        //             _id : this.currentUser._id,
        //            defaultGroup : this.currentUser.groups[0].groupId,
        //            defaultGroupEnabled: false  
        //         };
    
        //         this.user.patch(userPatch).subscribe((res) => {
        //             console.log(res)
        //             console.log("Created first default group for user. Default group has been added!")
        //         })
            
        //     }
        //     else {
    
        //         this._groups.setGroup({_id: this.currentUser.defaultGroup})
    
        //     }
        // }

        //this._groups.setUp();

        this._groups.listChange().subscribe(res => {
            res = this._groups.format(res);
            //set menu fields
            this.setNavFields(res);
            this.groups = res as Array<NavItem>;
        });

        this._groups.groupChange().subscribe(res => {
            
            this.selectedGroup = res;
        });

    }

    setNavFields(groups){
        groups.forEach((elem, val) => {
            groups[val].displayName = elem.groupName;
            this.setNavFields(groups[val].children);
        });
    }

    print(){
        
    }

    changeGroup(group) {
        this.groupMenu.closeMenu();
       // Patch to add update Default Group

       // If the Default Group Enabled does not exist (users havent saved a default group)
        if (!this.currentUser.defaultGroupEnabled)
        {
            let userPatch = {
                _id : this.currentUser._id,
                defaultGroup: group._id
            };

            this.user.patch(userPatch).subscribe((res) =>{
                
                
            })
        }
        // If the default Group Enabled exists (Users saved a default group)
        else{
            
            //Take the default group from the user input
        }

    
        
        this._groups.setGroup(group);
   
    }

    createGroup(){
        this.modal.open(CreateGroupModalComponent, {
            width: '50%'
        }).afterClosed().subscribe((result) => {
            if(result){
                this.groups.push(result);
            }
        });
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

    onLoggedout() {
        this.auth.logout();
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
}

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
import { Router, ActivatedRoute } from '@angular/router';
import { routerTransition } from '../router.animations';
import { HttpClient } from '@angular/common/http';
import { AppGlobals } from '../app.global';
import { UserService } from '../shared/services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'app/shared/services/auth.service';
import { AlertModalComponent } from '../shared/modules/alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [],
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    public User;
    public authResult;
    public returnUrl;
    public loginFailed = false;

    constructor(public router: Router, 
        private route: ActivatedRoute,
        private http: HttpClient,
        private  _global: AppGlobals,
        private cookie: CookieService,
        private dialog: MatDialog,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.User={};
        this.User.email = "";
        this.User.password = "";
        this.authResult={};

        this.auth.logout();

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onLoggedin() {
        //alert("User email: " + this.User.email + " User password: " + this.User.password);
        this.auth.login(this.User) //need to use /authorization
            .subscribe(
                (authResult) => {
                    if(this.cookie.check('access_token')){
                        this.router.navigate([this.returnUrl]);
                    }else {
                        if (authResult['user'] && !authResult['user']['enabled']) {
                            this.dialog.open(AlertModalComponent, {
                                width: '450px',
                                data: {
                                    type: 'ok',
                                    message: "Your account is not yet enabled. Please wait for approval."
                                }
                            });
                        }
                        else {
                            this.dialog.open(AlertModalComponent, {
                                width: '450px',
                                data: {
                                    type: 'alert',
                                    message: "Something went wrong... Please Refresh and try again."
                                }
                            });
                        }
                    }
                },
                (error) => {
                    this.loginFailed = true;
                    this.dialog.open(AlertModalComponent, {
                        width: '450px',
                        data: {
                            type: 'alert',
                            message: error + " Please try again"
                        }
                    });
                });
    }
}

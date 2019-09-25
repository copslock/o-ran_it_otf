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
import { routerTransition } from '../router.animations';
import { HttpClient } from '@angular/common/http';
import { AppGlobals } from '../app.global';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';
import { User } from '../shared/models/user.model';
import { MatDialog } from '@angular/material';
import { AlertModalComponent } from '../shared/modules/alert-modal/alert-modal.component';
import { AuthService } from '../shared/services/auth.service';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
    public user = {
        password: null,
        firstName: null,
        lastName: null,
        email: null
    };
    public passwordConfirm;

    constructor(public router: Router,
        private auth: AuthService,
        public dialog: MatDialog
        ) {
           
        }

    ngOnInit() {
        
    }

    register(){
        // let body  = {
        //     firstName: this.user.firstName,
        //     lastName: this.user.lastName,
        //     email: this.user.email,
        //     password: this.user.password
        // };
        
        if(this.user.password != this.passwordConfirm){
            const dialogRef = this.dialog.open(AlertModalComponent, {
                data:{
                    type: "Alert",
                    message: "Passwords must match!"
                }

            });
            
            return;
        }

        this.auth.register(this.user) 
            .subscribe(
                (res) => {
                    const r = this.dialog.open(AlertModalComponent, {
                        data: {
                            type: "Alert",
                            message: "Check your email to verify your account."
                        }
                    });

                    r.afterClosed().subscribe(res => {
                        this.router.navigateByUrl('/login');
                    })
                      
                },
                (err) => {
                    this.dialog.open(AlertModalComponent, {
                        data:{
                            type: "Alert",
                            message: err
                        }
                    });
                }
            );
        
        
    }
}

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


import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { AppGlobals } from 'app/app.global';
import { UserService } from '../services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private router: Router, private http: HttpClient, private cookie: CookieService) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.cookie.get('access_token') && this.cookie.get('currentUser')) {
            let currentUser = JSON.parse(this.cookie.get('currentUser'));
            if(currentUser['permissions'].indexOf('admin') >= 0){
                return true;
            }
            else{
                this.router.navigate(['/dashboard'], { queryParams: { returnUrl: state.url }});
                return false;
            }
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/dashboard'], { queryParams: { returnUrl: state.url }});
        return false;



    }
}

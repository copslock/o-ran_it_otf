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
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppGlobals } from '../../app.global';
import { map } from 'rxjs/operators';
import { FeathersService } from './feathers.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookie: CookieService, private http: HttpClient, private feathers: FeathersService) { }

  //logs user into the app and store the auth token in cookie
  login(userLogin): Observable<Object> {
    let body = userLogin;
    body.strategy = "local";
    return new Observable(observer => {
      this.feathers.authenticate(body)
        .subscribe(res => {
          this.storeUser(res);
          observer.next(res);
        },
        err => {
          observer.error(err);
        });
    });
    // return this.http.post(AppGlobals.baseAPIUrl + 'authentication', body, httpOptions)
    //   .pipe(map(authResult => {
    //     if (authResult && authResult['accessToken']) {
    //       this.storeUser(authResult);
    //     }
    //     return authResult;
    //   }));
  }

  register(user): Observable<Object> {
    return this.http.post(AppGlobals.baseAPIUrl + 'users', user, httpOptions);
  }

  //logs user out of app
  logout() {
    this.feathers.logout();
    window.localStorage.clear();
    this.cookie.delete('access_token');
    this.cookie.delete('currentUser');
  }

  //store a user
  storeUser(user) {

    if (user.accessToken) {
      window.localStorage.setItem('access_token', user['accessToken'])
      window.localStorage.setItem('user_rules', JSON.stringify(user['user']['rules']));

      //The rules are too large to store as a cookie
      delete user['user']['rules'];

      this.cookie.set('access_token', JSON.stringify(user['accessToken']));
      this.cookie.set('currentUser', JSON.stringify(user['user']));
    }
  }
}

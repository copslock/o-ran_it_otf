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


    
import { Injectable, OnInit } from '@angular/core';

import * as feathers from '@feathersjs/client';
import * as io from 'socket.io-client';
import * as socketio from '@feathersjs/socketio-client';
import * as authentication from '@feathersjs/authentication-client';
import { Observable, from, interval } from 'rxjs';
import { now } from 'moment';
import { AppGlobals } from 'app/app.global';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class FeathersService {
  // There are no proper typings available for feathers, due to its plugin-heavy nature
  private _feathers: any;
  public _socket: any;
  public auth: Observable<Object>;
  
  constructor(private route: Router) {
    this._socket = io('/',{
      transports: ['websocket']
    });       // init socket.io
    this._socket.on('connect_error', function(data){
      route.navigateByUrl('/login');
    });
    this._feathers = feathers();                      // init Feathers             // add hooks plugin
    this._feathers.configure(socketio(this._socket, {
        timeout: 100000000
    })); // add socket.io plugin
    this._feathers.configure(authentication({
        storage: window.localStorage,
        storageKey: 'access_token'
    }));

    //set observiable for services to check before calling the service
    this.auth = from(this._feathers.authenticate());
    
  }

  // expose services
  public service(name: string) {
    return this._feathers.service(name);
  }

  public socket(){
    return this._socket;
  }

  // expose authentication
  public authenticate(credentials?): Observable<Object> { 
    return new Observable(observer => {
      this.auth = from(this._feathers.authenticate(credentials).then(res => {
        observer.next(res);
      }, err => {
        observer.error(err);
        this.route.navigate(['/login'])
      }));
    });

  }

  // expose logout
  public logout() {
    return this._feathers.logout();
  }
}


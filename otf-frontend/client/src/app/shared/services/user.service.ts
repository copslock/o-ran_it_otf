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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ModelService } from './model.service';
import { ParamsService } from './params.service';
import { CookieService } from 'ngx-cookie-service';
import { FeathersService } from './feathers.service';
import { Ability } from '@casl/ability';


@Injectable({
  providedIn: 'root'
})
export class UserService extends ModelService {

  public ability: Ability;

  constructor(http: HttpClient, Params: ParamsService, cookie: CookieService, private c: CookieService, feathers: FeathersService){
    super('users', http, Params, cookie, feathers);
    this.ability = new Ability(JSON.parse(localStorage.getItem('user_rules')));
  }

  getId(){
    return JSON.parse(this.cookie.get('currentUser'))._id;
  }

  // addFavorite(ref: string, id: string){
  //   return this.get(this.getId()).pipe(map(
  //     result => {
  //       if(!result['favorites']){
  //         result['favorites'] = {};
  //       }
  //       if(!result['favorites'][ref]){
  //         result['favorites'][ref] = [];
  //       }
  //       result['favorites'][ref].push(id);
  //       result['favorites'][ref] = Array.from(new Set(result['favorites'][ref]));
  //       this.patch(result).subscribe();
  //     }
  //   ));
  // }

  // removeFavorite(ref: string, id: string){
  //   return this.get(this.getId()).pipe(map(
  //     result => {
  //       result['favorites'][ref].splice( result['favorites'][ref].indexOf(id), 1 );
  //       this.patch(result).subscribe();
  //     }
  //   ));
  // }

  enableUser(id: string, enabled: boolean){
      return this.patch({
          "_id" : id,
          "enabled": enabled
      })

  }
}
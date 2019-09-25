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
import { ModelService } from './model.service';
import { HttpClient } from '@angular/common/http';
import { ParamsService } from './params.service';
import { CookieService } from 'ngx-cookie-service';
import { FeathersService } from './feathers.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService extends ModelService {

  constructor(http: HttpClient, Params: ParamsService, cookie: CookieService, feathers: FeathersService){
    super('health', http, Params, cookie, feathers);
  }
  
  get(id, params?): Observable<any>{
    return super.call('get', {data: id, params: params}, '/otf/api/health/v1');
  }
}

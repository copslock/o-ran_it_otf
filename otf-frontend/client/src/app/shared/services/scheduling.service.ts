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


import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppGlobals } from "../../app.global";
import { ParamsService } from "./params.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { ModelService } from './model.service';
import { CookieService } from "ngx-cookie-service";
import { TestInstanceService } from "./test-instance.service";
import { MatDialog } from "@angular/material";
import { TestDefinitionService } from "./test-definition.service";
import { ExecuteService } from "./execute.service";
import { FeathersService } from "./feathers.service";

@Injectable({
  providedIn: 'root'
})

export class SchedulingService extends ModelService {

  constructor(http: HttpClient, Params: ParamsService, cookie: CookieService, feathers: FeathersService, private td: TestDefinitionService, private instance: TestInstanceService, private execute: ExecuteService, private dialog: MatDialog) {
    super('jobs', http, Params, cookie, feathers);  
  }

  // create(data, params?): Observable<Object> {
  //   return new Observable((observer) => {
  //     this.instance.get(data.testInstanceId, { $select: ['testData'] }).subscribe(result => {
  //       if(result){
  //         super.create(data).subscribe(
  //           res => {
  //             observer.next(res);
  //           },
  //           err => {
  //             observer.error(err);
  //           }
  //         )
  //       }        
  //     });
  //   });
  // }


}
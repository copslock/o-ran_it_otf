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
import { AppGlobals } from '../../app.global';
import { Observable } from 'rxjs';
import { ParamsService } from './params.service';
import { CookieService } from 'ngx-cookie-service';
import { ModelService } from './model.service';
import { FeathersService } from './feathers.service';
import { GroupService } from './group.service';



@Injectable({
  providedIn: 'root'
})

export class TestDefinitionService extends ModelService {

  constructor(http: HttpClient, Params: ParamsService, cookie: CookieService, feathers: FeathersService, private _groups: GroupService) {
    super('test-definitions', http, Params, cookie, feathers);
    this.deployAll();
  }

  create(data, params?): Observable<Object>{
    this.setGroup(data);
    return super.create(data, params);
  }

  validate(testDefinition): Observable<Object> {
    return this.call('create', {data: { testDefinition: testDefinition } }, AppGlobals.baseAPIUrl + 'bpmn-validate')
    //return this.http.post(AppGlobals.baseAPIUrl + 'bpmn-validate', {testDefinition: testDefinition}, this.getHttpOptions());
  }

  validateSave(testDefinition): Observable<Object> {
    return this.call('update', { data: {_id: null, testDefinition: testDefinition } }, AppGlobals.baseAPIUrl + 'bpmn-validate')
    //return this.http.put(AppGlobals.baseAPIUrl + 'bpmn-validate', {testDefinition: testDefinition}, this.getHttpOptions());
  }

  check(processDefinitionKey): Observable<Object>{
    return this.call('get', {data: processDefinitionKey} , AppGlobals.baseAPIUrl + 'bpmn-validate')
    //return this.http.get(AppGlobals.baseAPIUrl + 'bpmn-validate/' + processDefinitionKey, this.getHttpOptions());
  }

  deploy(testDefinition, versionName?): Observable<Object> {
    let data = {testDefinition: testDefinition};

    if(versionName != null && versionName != undefined){
      data['version'] = versionName;
    }
    return this.call('create', {data: data }, AppGlobals.baseAPIUrl + 'bpmn-upload')
    //return this.http.post(AppGlobals.baseAPIUrl + 'bpmn-upload', {testDefinition: testDefinition}, this.getHttpOptions());
  }

  deployAll(){
    // this.find({$limit: -1}).subscribe(definitions => {
    //   //definitions = definitions['data'];
    //   (definitions as Array<Object>).forEach((elem, val) => {
    //     elem['bpmnInstances'].forEach((e , v) => {
    //       let el = e;
    //       this.deploy(elem, el.version).subscribe(res => {
    //         console.log(res);
    //       });
    //     })
    //   })
    // })
  }

  private setGroup(data){
    if(!data['groupId']){
      data['groupId'] = this._groups.getGroup()['_id'];
    }
  }
}

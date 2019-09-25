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


import { Injectable } from "@angular/core";
import { toInteger } from "@ng-bootstrap/ng-bootstrap/util/util";

@Injectable({
    providedIn: 'root'
})

export class ToHtml {
    constructor() {}

    convert(json:any = [{name: 'Adam', age: 23}, {name: 'Raj', age: 22}, {name: 'Justin', age: 5}], tabs = 0){
        var html = '';
        var tabHtml = '';
        if(typeof json === 'string'){
          json = JSON.parse(json);
        }
        for(let i = 0; i < tabs; i++){
          tabHtml += '&nbsp;&nbsp;&nbsp;&nbsp;';
        }
        for(let key in json){
          if(json.hasOwnProperty(key)){
            if(typeof json[key] === "object"){
              html += tabHtml + '<b><u>' + key + ':</u></b><br/>';
              if(json.constructor === Array && toInteger(key) > 0){
                tabs--;
              }
              html += this.convert(json[key], ++tabs);
            }else{
              html += tabHtml + '<b><u>' + key + ':</u></b>' + '<br/>';
              if(typeof json[key] === 'string'){
                json[key] = json[key].replace(/\\n/g, '<br/>' + tabHtml);
              }
              html += tabHtml + json[key] + '<br/>';
              html += '<br/>';
            }
          }
        }
        return html;
      }
    
    convertString(str){
        return str.replace(/\\n/g, '<br/>');
    }
}
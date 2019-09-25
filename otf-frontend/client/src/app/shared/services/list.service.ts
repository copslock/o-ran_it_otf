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
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  listMap: {[uniqueKey: string]: {listSource: any, currentList: any} } = {};
  // private listSource = new BehaviorSubject(null);
  // currentList = this.listSource.asObservable();

  constructor() { }

  createList(key){
    this.listMap[key] = {
      listSource: new BehaviorSubject(null),
      currentList: null
    }
    this.listMap[key].currentList = this.listMap[key].listSource.asObservable();
    this.listMap[key].listSource.next([]);
  }

  changeMessage(key, message: any) {
    if(!this.listMap[key])
      this.createList(key);

    this.listMap[key].listSource.next(message)
  }

  addElement(key, obj: any){
    this.listMap[key].currentList.subscribe(function(value){
      //console.log(value);
      value.push(obj);
    });
  }

  removeElement(key, object_field_name, id: any){
    let val = 0;
    this.listMap[key].currentList.subscribe(function(value){
      value.forEach(function(elem, val) {
        if(elem[object_field_name] == id){
          value.splice(val, 1);
        }
      });
    });
    
  }

  updateElement(key, object_field_name, id: any, new_object){
    let val = 0;
    this.listMap[key].currentList.subscribe(function(value){
      value.forEach(function(elem, val) {
        if(elem[object_field_name] == id){
          value[val] = new_object;
        }
      })
    });
  }

}

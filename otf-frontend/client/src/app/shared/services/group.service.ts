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
import { ParamsService } from './params.service';
import { ModelService } from './model.service';
import { CookieService } from 'ngx-cookie-service';
import { FeathersService } from './feathers.service';
import { Observable, Subject } from 'rxjs';
import * as organizeGroups from '../../../../../server/src/feathers/hooks/permissions/get-permissions';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends ModelService {

  protected groupList;
  protected selectedGroup;

  protected groupListChange: Subject<Array<any>> = new Subject<Array<any>>();
  protected selectedGroupChange: Subject<Object> = new Subject<Object>();

  constructor(http: HttpClient, Params: ParamsService, cookie: CookieService, feathers: FeathersService, private _users: UserService) {
    super('groups', http, Params, cookie, feathers);
    this.setUp();
  }
  //new edit:
  public currentUser;

  setUp() {
    let currentId = window.localStorage.getItem('currentGroupId');

    this.currentUser = JSON.parse(this.cookie.get('currentUser'));

    this.find({ $limit: -1, lookup: 'both' }).subscribe(res => {
      this.setGroupList(res);

      if (currentId) {
        this.setGroup(this.groupList.filter(elem => elem._id == currentId)[0]);
      } else if (this.currentUser.defaultGroup) {
        this.setGroup(this.groupList.filter(elem => elem._id == this.currentUser.defaultGroup)[0]);
      }else {
        //set to first group
      }
    },
      err => {
        console.log(err);
      })
  }



  getGroup() {
    return this.selectedGroup;
  }

  getGroupList() {
    return this.groupList;
  }

  setGroup(group: any) {
    this.selectedGroup = group;
    window.localStorage.setItem('currentGroupId', group._id);
    this.selectedGroupChange.next(this.selectedGroup);
    if (!this.currentUser.defaultGroupEnabled) {
      let userPatch = {
        _id: this.currentUser._id,
        defaultGroup: group._id,
        defaultGroupEnabled: false
      };

      this._users.patch(userPatch).subscribe((res) => {
        
      });
    }
  }

  organizeGroups(groups){
    return organizeGroups(this.currentUser, groups);
  }

  setGroupList(groups) {
    this.groupList = organizeGroups(this.currentUser, groups);
    this.groupListChange.next(this.groupList);
  }

  listChange(): Subject<Array<any>> {
    return this.groupListChange;
  }

  groupChange(): Subject<Object> {
    return this.selectedGroupChange;
  }

  format(arr: Array<any>) {

    //puts all groups in a single level array
    // arr = organizeGroups(this.currentUser, arr);

    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem;

    // First map the nodes of the array to an object -> create a hash table.
    for (var i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      mappedArr[arrElem._id] = arrElem;
      mappedArr[arrElem._id]['children'] = [];
    }


    for (var _id in mappedArr) {
      if (mappedArr.hasOwnProperty(_id)) {
        mappedElem = mappedArr[_id];
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentGroupId && mappedArr[mappedElem['parentGroupId']]) {
          mappedArr[mappedElem['parentGroupId']]['children'].push(mappedElem);
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          tree.push(mappedElem);
        }
      }
    }
    return tree;
  }


}

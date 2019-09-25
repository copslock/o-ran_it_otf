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


import { Component, OnInit, Output } from '@angular/core';
import { routerLeftTransition } from '../../../router.animations';
import { ListService } from '../../../shared/services/list.service';
import { HttpClient } from '@angular/common/http';
import { AppGlobals } from '../../../app.global';
import { Router,  NavigationExtras } from '@angular/router';
import { TestDefinitionService } from '../../../shared/services/test-definition.service';


@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.pug',
  styleUrls: ['./create-test.component.scss', '../onboarding.component.scss'],
  providers: [AppGlobals],
  animations: [routerLeftTransition()]
})
export class CreateTestComponent implements OnInit {

  public test_list = [];
  public search;

  @Output() public listKey;

  constructor(private router: Router, private testDefinition: TestDefinitionService, private list: ListService, private http: HttpClient, private _global: AppGlobals) {

  }

  back() {
    this.router.navigateByUrl('/onboarding/test-head');
  }

  next() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
          "testDefinition": JSON.stringify(this.test_list[this.test_list.length - 1])
      }
    };
    this.router.navigate(['/onboarding/test-instances'], navigationExtras);
  }

  ngOnInit() {

    this.search = {};
    this.search.testName = "";

    this.listKey = 'td';

    //Create List with list service
    this.list.createList(this.listKey);

    //Subscribe to list service
    this.list.listMap[this.listKey].currentList.subscribe((list) =>{
      this.test_list = list;
    });
  }

}

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


import { Component, OnInit, ViewContainerRef, Output, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routerLeftTransition } from '../../../router.animations';
import { Router } from '@angular/router';
import { ListService } from '../../../shared/services/list.service';
import { TestHeadModalComponent } from '../../../shared/modules/test-head-modal/test-head-modal.component';
import { MatDialog } from '@angular/material';
import { TestHeadService } from '../../../shared/services/test-head.service';

@Component({
  selector: 'app-test-head',
  templateUrl: './test-head.component.pug',
  styleUrls: ['./test-head.component.scss', '../onboarding.component.scss'],
  animations: [routerLeftTransition()]
})
export class TestHeadComponent implements OnInit {

  public vth_list;
  public search;

  @Output() public createFormOptions = {
    goal: 'create'  
  }

  constructor(
    private router: Router, 
    private list: ListService,
    public dialog: MatDialog,
    private testHead: TestHeadService
  ) {
    
   }

  next() {
    this.router.navigateByUrl('/onboarding/test-definition');
  }

  back() {
    this.router.navigateByUrl('/onboarding');
  }

  openTestHead(testHead): void {
    const dialogRef = this.dialog.open(TestHeadModalComponent, {
      width: '450px',
      data: {
        goal: 'edit',
        testHead: testHead
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  ngOnInit() {

    this.search = {};
    this.search._id = "";
    this.search.testHeadName = "";

    this.list.createList('vth');
    
    this.testHead.find({$limit: -1})
      .subscribe((vth_list) => {
        this.list.changeMessage('vth', vth_list);
      });

    this.list.listMap['vth'].currentList.subscribe((list) =>{
      this.vth_list = list;
    });

  }

}

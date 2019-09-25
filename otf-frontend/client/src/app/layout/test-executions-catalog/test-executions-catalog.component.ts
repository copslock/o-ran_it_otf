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


import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { MatPaginator, MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ListService } from 'app/shared/services/list.service';
import { TestInstanceService } from 'app/shared/services/test-instance.service';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { routerTransition } from 'app/router.animations';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { GroupService } from 'app/shared/services/group.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-executions-catalog',
  templateUrl: './test-executions-catalog.component.pug',
  styleUrls: ['./test-executions-catalog.component.scss'],
  animations: [routerTransition()]
})
export class TestExecutionsCatalogComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];
  public dataSource;
  public displayedColumns: string[] = ['testInstanceName', 'testInstanceDescription', 'result', 'totalTime', 'options'];
  public resultsLength;
  public loading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private list: ListService,
    private testExecution: TestExecutionService,
    private modal: MatDialog,
    private route: ActivatedRoute,
    private _groups: GroupService,
    private snack: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.setComponentData(this._groups.getGroup());
    this.toDestroy.push(this._groups.groupChange().subscribe(group => {
      this.setComponentData(group);
    }));
  }

  ngOnDestroy() {
    this.toDestroy.forEach(e => e.unsubscribe());
  }

  setComponentData(group) {
    if (!group) {
      return;
    }
    this.loading = true;

    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;

    //RG: Hard limit returns object, -1 returns array
    const params = { $limit: 50, groupId: group._id, $populate: ['testInstanceId'], $sort: { startTime: -1 } }//['$limit=-1', '$populate[]=testInstanceId', '$sort[startTime]=-1'];
    if (this.route.snapshot.params['filter']) {
      params['testResult'] = this.route.snapshot.params['filter'].toUpperCase();
    }
    this.testExecution.find(params).subscribe((response) => {

      let list = response;
      //RG: check if hard limit if so it will be object w/ prop data
      if(!Array.isArray(response) && response.hasOwnProperty('data')){
        list = response['data'];
      }
      for (let i = 0; i < list['length']; i++) {
        const tsDate = new Date(list[i]['startTime']);
        const teDate = new Date(list[i]['endTime']);
        list[i]['totalTime'] = (teDate.getTime() - tsDate.getTime()) / 1000;
      }
      this.dataSource.data = list;
      this.resultsLength = this.dataSource.data.length;
      this.loading = false;
    });

  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTestInstance() {
    // const create = this.modal.open(TestDefinition, {
    //   width: '450px',
    //   data: {
    //     goal: 'create'
    //   }
    // });

    // create.afterClosed().subscribe(result => {
    //   this.list.listMap['vth'].currentList.subscribe(x => {
    //     this.dataSource = x;
    //   });
    // });
  }


  editTestInstance(th) {
    // const edit = this.modal.open(TestHeadModalComponent, {
    //   width: '450px',
    //   data: {
    //     goal: 'edit',
    //     testHead: th
    //   }
    // });

    // edit.afterClosed().subscribe(result => {
    //   console.log(result);
    // });
  }

  deleteTestInstance(te) {
    const deleter = this.modal.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to delete ' + te.testExecutionName + ' ?'
      }
    });

    deleter.afterClosed().subscribe(result => {
      if (result) {
        this.testExecution.delete(te._id).subscribe(response => {
          this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: {
              message: 'Test Execution Deleted'
            }
          });
          this.list.removeElement('te', '_id', te._id + '');
          this.list.listMap['te'].currentList.subscribe(x => {
            this.dataSource.data = x;
            this.resultsLength = x.length;
          });
        });
      }
    });
  }
}

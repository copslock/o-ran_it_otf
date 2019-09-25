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


import { Component, OnInit, Output, Input, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppGlobals } from '../../app.global';
import { routerTransition } from '../../router.animations';
import { ListService } from '../../shared/services/list.service';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { TestHeadService } from '../../shared/services/test-head.service';
import { TestHeadModalComponent } from '../../shared/modules/test-head-modal/test-head-modal.component';
import { AlertModalComponent } from '../../shared/modules/alert-modal/alert-modal.component';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { GroupService } from 'app/shared/services/group.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-virtual-test-heads',
  templateUrl: './virtual-test-heads.component.pug',
  providers: [AppGlobals],
  styleUrls: ['./virtual-test-heads.component.scss'],
  animations: [routerTransition()]
})
export class VirtualTestHeadsComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];
  public dataSource;
  public displayedColumns: string[] = ['name', 'description', 'options'];
  public resultsLength;
  public loading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private testHead: TestHeadService,
    private router: Router,
    private modal: MatDialog,
    private snack: MatSnackBar,
    private _groups: GroupService) { }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  ngOnInit() {
    this.setComponentData(this._groups.getGroup());
    this.toDestroy.push(this._groups.groupChange().subscribe(group => {
      this.setComponentData(group);
    }));
  }

  ngOnDestroy(){
    this.toDestroy.forEach(e => e.unsubscribe());
  }

  setComponentData(group) {
    if(group){
      
      this.dataSource = new MatTableDataSource();
      this.dataSource.paginator = this.paginator;

      this.testHead.find({ $limit: -1, groupId: group['_id'], $sort: { createdAt: -1 } }).subscribe((list) => {
        this.dataSource.data = list;
        this.resultsLength = this.dataSource.data.length;
        this.loading = false;
      })
    }
  }

  createTestHead() {
    const create = this.modal.open(TestHeadModalComponent, {
      width: '90%',
      data: {
        goal: 'create'
      }
    })

    create.afterClosed().subscribe(result => {
      this.ngOnInit();
      // this.list.listMap['vth'].currentList.subscribe(x => {
      //   this.dataSource.data = x;
      //   this.resultsLength = this.dataSource.data.length;
      // });
    });
  }


  editTestHead(th) {
    const edit = this.modal.open(TestHeadModalComponent, {
      width: '90%',
      data: {
        goal: 'edit',
        testHead: th
      }
    });

    edit.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  deleteTestHead(th) {
    const deleter = this.modal.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to delete ' + th.testHeadName + '? There may be test definitions using this test head.'
      }
    });

    deleter.afterClosed().subscribe(result => {
      if (result) {
        this.testHead.delete(th._id).subscribe(response => {
          this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: {
              message: 'Test Head Deleted'
            }
          });

          this.ngOnInit();
        });
      }
    });
  }

  navToTestHead(id){
    this.router.navigate(['/test-heads', id]);
  }

}

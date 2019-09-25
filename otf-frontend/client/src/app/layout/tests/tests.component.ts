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


import { Component, OnInit, ViewContainerRef, ViewChild, AfterContentInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routerTransition } from '../../router.animations';
import { ListService } from '../../shared/services/list.service';
import { Router } from '@angular/router';
import { TestDefinitionService } from '../../shared/services/test-definition.service';
import { TestInstanceService } from '../../shared/services/test-instance.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatDialog, MatSnackBar } from '@angular/material';
import { AlertModalComponent } from '../../shared/modules/alert-modal/alert-modal.component';
import { CreateTestComponent } from '../onboarding/create-test/create-test.component';
import { TestDefinitionModalComponent } from 'app/shared/modules/test-definition-modal/test-definition-modal.component';
import { ViewWorkflowModalComponent } from 'app/shared/modules/view-workflow-modal/view-workflow-modal.component';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { TestInstanceModalComponent } from '../../shared/modules/test-instance-modal/test-instance-modal.component';
import { UserService } from 'app/shared/services/user.service';
import { CookieService } from "ngx-cookie-service";
import { GroupService } from 'app/shared/services/group.service';
import { appInitializerFactory } from '@angular/platform-browser/src/browser/server-transition';
import { element } from '@angular/core/src/render3/instructions';
import { GridOptionsWrapper, RowNode, initialiseAgGridWithAngular1 } from 'ag-grid-community';
import { every } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.pug',
  styleUrls: ['./tests.component.scss'],
  animations: [routerTransition()]
})
export class TestsComponent implements OnInit, OnDestroy {

  private toDestroy: Array<Subscription> = [];

  public dataSource;
  public displayedColumns: string[] = ['lock', 'name', 'description', 'id', 'processDefinitionKey', 'options'];
  public resultsLength;
  public loading = false;


  public columns = [
    
    {headerName: 'Name', field: 'testName', sortable: true, filter: true, resizable: true, checkboxSelection:true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true, width: 300},
    {headerName: 'Description', field: 'testDescription', sortable: true, filter: true, resizable: true},
    {headerName: 'Id', field: '_id', sortable: true, filter: true, resizable: true, editable: true},
    {headerName: 'Process Definition key', field: 'processDefinitionKey', sortable: true, filter: true, resizable: true},
    {headerName: '', field: 'disabled', cellRenderer: this.disabledIndicator, hide: false, width: 80}
    
  ];
  public rowData;
  
  /*
  public rowData =  [
    { _id: '5cfe7e5d6f4e5d0040a3b235', testDescription: 'For testing', testName: "testflow", processDefinitionKey: "demo"},
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 }
]; */

  public hasSelectedRows = false;
  public selectedSingleRow = false;
  public selectedUnlockedRows = true;
  public selectedLockedRows = false; 

  private gridApi;
  private gridColumnApi;
  private selectedRows = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private http: HttpClient,
    private router: Router,
    private viewRef: ViewContainerRef,
    private testDefinition: TestDefinitionService,
    private modal: MatDialog,
    private snack: MatSnackBar,
    private user: UserService,
    private testInstanceService: TestInstanceService,
    private cookie: CookieService,
    private _groups: GroupService
  ) { }
  
  ngOnInit() {

    this.setComponentData(this._groups.getGroup());
    this.toDestroy.push(this._groups.groupChange().subscribe(group => {
      this.setComponentData(group);
    }));


  }

  ngOnDestroy() {
    this.toDestroy.forEach(elem => elem.unsubscribe());
  }

  setComponentData(group) {
    
    if(!group){
      return;
    }

    this.loading = true;

    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;


  
    this.testDefinition.find({
      $limit: -1,
      groupId: group['_id'],
      $sort: {
        createdAt: -1
      },
      $select: ['testName', 'testDescription', 'processDefinitionKey', 'bpmnInstances.isDeployed', 'disabled', 'groupId']
    }).subscribe((list) => {
      this.dataSource.data = list;
      this.resultsLength = this.dataSource.data.length;
      this.loading = false;
      // Getting row data filled with list
      this.rowData = list;



      //console.log("This is the rowdata: "+ JSON.stringify(this.rowData[1]))
      //this.rowData = [].concat.apply([], list);
    })
  
   
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
//createInstance(element)
  createInstance() {
    

    this.selectedRows = this.gridApi.getSelectedRows().map(({ _id, testName }) => ({_id, testName}));
    
    const create = this.modal.open(TestInstanceModalComponent, {
      width: '90%',
      data: {
        td: this.selectedRows[0]._id//element._id
      },
      disableClose: true
    });
  }

  create() {
    let create = this.modal.open(TestDefinitionModalComponent, {
      disableClose: true
    });

    create.afterClosed().subscribe(res => {
      this.ngOnInit();
    })
  }


  // view(td){
  //   this.modal.open(ViewWorkflowModalComponent, {
  //     width: '90%',
  //     height: '70%',
  //     maxWidth: '100%',
  //     data: {
  //       id: td._id
  //     }
  //   });
  // }





  deleteMultiple(){
    for(let i = 0; i < this.gridApi.getSelectedNodes().length; i++){
      this.delete(i);
    }
  }

  delete(td) {

    this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testName }) => ({_id, testName}));
    const deleter = this.modal.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to delete ' + this.selectedRows[td].testName + '? Any test instances or executions using this test definition will no longer work.'
      }
    });

    deleter.afterClosed().subscribe(result => {
      if (result) {
        this.testDefinition.delete(this.selectedRows[td]._id).subscribe(response => {
          this.snack.openFromComponent(AlertSnackbarComponent, {
            duration: 1500,
            data: {
              message: 'Test definition was deleted'
            }
          })
          //this.ngOnInit();
          this.setComponentData(this._groups.getGroup());
        });
      }
    });
  }

  edit() {
    this.selectedRows = this.gridApi.getSelectedRows().map(({_id }) => ({_id}));
    var editor = this.modal.open(TestDefinitionModalComponent, {
      disableClose: true,
      data: {
        testDefinitionId: this.selectedRows[0]._id
      }
    });
  }

  lockMultiple(){
   
    for(let i = 0; i < this.gridApi.getSelectedNodes().length; i++){
      this.lock(i);
    }

  }


  lock(td) {
    this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testName, groupId,  }) => ({_id, testName, groupId}));

    let user = JSON.parse(this.cookie.get('currentUser'));
    let isAdmin = false;
    for (let i = 0; i < user.groups.length; i++) {
      if (this.selectedRows[td].groupId === user.groups[i].groupId) {
        if (user.groups[i].permissions.includes("admin")) {
          isAdmin = true;
        }
      }
    }
    user = '';
    if (!isAdmin) {
      this.modal.open(AlertModalComponent, {
        width: '250px',
        data: {
          type: 'alert',
          message: 'You do not have the correct permissions to lock/unlock test definitions.'
        }
      })
      return;
    }
    this.modal.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to lock ' + this.selectedRows[td].testName + '? All test instances using this test definition will be locked and no more instances can be created until unlocked.'
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        let testDef = {
          '_id': this.selectedRows[td]._id,
          'disabled': true
        }
        this.testDefinition.patch(testDef).subscribe((res) => {
          this.selectedRows[td].disabled = true;
          this.testInstanceService.find({ $limit: -1, testDefinitionId: this.selectedRows[td]._id }).subscribe((result) => {
            
            

            if (result['length']) {
              for (let i = 0; i < result['length']; i++) {
                let ti = {
                  '_id': null,
                  'disabled': true
                }
                ti._id = result[i]._id;
                ti.disabled = true;
                let temp = ti;
              
                this.testInstanceService.patch(ti).subscribe((results) => {
                 
                  this.snack.openFromComponent(AlertSnackbarComponent, {
                    duration: 1500,
                    data: {
                      message: 'Test Instance ' + results['testInstanceName'] + ' was locked'
                    }
                  })
                });
              }
            } else {
              let ti = {
                '_id': null,
                'disabled': true
              }
              ti._id = result['_id'];
              this.testInstanceService.patch(ti).subscribe((results) => {
                this.snack.openFromComponent(AlertSnackbarComponent, {
                  duration: 1500,
                  data: {
                    message: 'Test Instance ' + results['testInstanceName'] + ' was locked'
                  }
                })
              });;
            }
          });
          this.setComponentData(this._groups.getGroup());
        }, (error) => {
          this.modal.open(AlertModalComponent, {
            width: '250px',
            data: {
              type: "alert",
              message: 'Test Definition could not be locked.'
            }
          })
        });

      }
    })
  }


  updateData(){
    
    this.setComponentData(this._groups.getGroup());
  }

  unlockMultiple() {
    for(let i = 0; i < this.gridApi.getSelectedNodes().length; i++){
      this.unlock(i);
    }
  }
//unlock multiple and loop through single unlock
  unlock(td) {
    this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testName, groupId,  }) => ({_id, testName, groupId}));
    let user = JSON.parse(this.cookie.get('currentUser'));
    let isAdmin = false;
    for (let i = 0; i < user.groups.length; i++) {
      if (this.selectedRows[td].groupId === user.groups[i].groupId) {
        if (user.groups[i].permissions.includes("admin")) {
          isAdmin = true;
        }
      }
    }
    user = '';
    if (!isAdmin) {
      this.modal.open(AlertModalComponent, {
        width: '250px',
        data: {
          type: 'alert',
          message: 'You do not have the correct permissions to lock/unlock test definitions.'
        }
      })
      return;
    }

    this.modal.open(AlertModalComponent, {
      width: '250px',
      data: {
        type: 'confirmation',
        message: 'Are you sure you want to unlock ' + td.testName + '? All test instances using this test definition will be unlocked as well.'
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        let testDef = {
          '_id': this.selectedRows[td]._id,
          'disabled': false
        }
        this.testDefinition.patch(testDef).subscribe((res) => {
          this.selectedRows[td].disabled = false;
          this.testInstanceService.find({ $limit: -1, testDefinitionId: this.selectedRows[td]._id }).subscribe((result) => {
           
            // console.log(result);
            if (result['length']) {
              for (let i = 0; i < result['length']; i++) {
                let ti = {
                  '_id': null,
                  'disabled': false
                }
                ti._id = result[i]._id;
                ti.disabled = false;
                this.testInstanceService.patch(ti).subscribe((results) => {
                  this.snack.openFromComponent(AlertSnackbarComponent, {
                    duration: 1500,
                    data: {
                      message: 'Test Instance ' + results['testInstanceName'] + ' was unlocked'
                    }
                  })
                });
              }
            } else {
              let ti = {
                '_id': null,
                'disabled': false
              }
              ti._id = result['_id'];
              
              this.testInstanceService.patch(ti).subscribe((results) => {
                this.snack.openFromComponent(AlertSnackbarComponent, {
                  duration: 1500,
                  data: {
                    message: 'Test Instance ' + results['testInstanceName'] + ' was unlocked'
                  }
                })
              });;
            }
          });
          this.setComponentData(this._groups.getGroup());
        }, (error) => {
          this.modal.open(AlertModalComponent, {
            width: '250px',
            data: {
              type: "alert",
              message: 'Test Definition could not be locked.'
            }
          })
        });

      }
    })
  }


  isDeployed(element) {
    let deployed = false;
    if (element.bpmnInstances) {
      element.bpmnInstances.forEach(elem => {
        if (elem.isDeployed) {
          deployed = true;
        }
      });
    }
    return deployed;
  }



  onRowSelected(event){

    this.selectedRows = this.gridApi.getSelectedRows().map(({ _id, disabled  }) => ({ _id, disabled}));

    if(event.api.getSelectedNodes().length > 0){
      this.hasSelectedRows = true;

      //Checks for all Unlocked rows
      for (let i = 0; i < event.api.getSelectedNodes().length; i++ )
      {

        if(!this.selectedRows[i].disabled)
        {
          this.selectedUnlockedRows = true;
        }
        else{
          this.selectedUnlockedRows = false;
          break;
        }
      }

      //Checks for all Locked rows
      for (let i = 0; i < event.api.getSelectedNodes().length; i++ )
      {

        if(this.selectedRows[i].disabled)
        {
          this.selectedLockedRows = true;
        }
        else{
          this.selectedLockedRows = false;
          break;
        }
      }





    }
    else{
      this.hasSelectedRows = false;
      this.selectedLockedRows = false;
      this.selectedUnlockedRows = true; 

    }
    //One Row was selected
    if((event.api.getSelectedNodes().length == 1)){
      this.selectedSingleRow = true;
     
    }else{
      this.selectedSingleRow = false;
    }

  }

  onGridReady(params){
    this.gridApi = params.api;
    
    this.gridColumnApi = params.columnApi;

    //auto size the column widths
    this.gridColumnApi.autoSizeColumns(['name']);
  }

  disabledIndicator(params){
    if (params.value){
      return `<mat-icon class="mat-icon mat-icon-no-color" role="img" >
       locked</mat-icon>`;   
    }
  }




  navToDefinition(event){
    this.router.navigate(['/test-definitions', event.data._id]);
  }

  testDefinitionModeler(){
    this.router.navigate(['/modeler'], {queryParams: {testDefinitionId: this.selectedRows[0]._id}});
  }

}

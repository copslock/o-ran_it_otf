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


import { Component, OnInit, ViewChild, ViewContainerRef, AfterViewInit, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource, MatListItem } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../shared/services/list.service';
import { AlertModalComponent } from '../../shared/modules/alert-modal/alert-modal.component';
import { TestInstanceService } from '../../shared/services/test-instance.service';
import { routerTransition } from 'app/router.animations';
import { SchedulingService } from '../../shared/services/scheduling.service';
import { TestInstanceModalComponent } from '../../shared/modules/test-instance-modal/test-instance-modal.component';
import { AlertSnackbarComponent } from '../../shared/modules/alert-snackbar/alert-snackbar.component';
import { ScheduleTestModalComponent } from '../../shared/modules/schedule-test-modal/schedule-test-modal.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TestDefinitionService } from '../../shared/services/test-definition.service';
import { Observable, Subscription } from 'rxjs';
import { ExecuteService } from 'app/shared/services/execute.service';
import { GroupService } from 'app/shared/services/group.service';
import { GridOptions } from "ag-grid-community";


@Component({
    selector: 'app-test-instances-catalog',
    templateUrl: './test-instances-catalog.component.pug',
    styleUrls: ['./test-instances-catalog.component.scss'],
    animations: [routerTransition(),
    trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
        state('expanded', style({ height: '*' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
    ]
})
export class TestInstancesCatalogComponent implements OnInit, AfterViewInit, OnDestroy {


    public resultsLength;
    public loading = false;


    public columnDefs = [
        {headerName: '', field: 'disabled', cellRenderer: this.disabledIndicator, width: 100, hide: false, checkboxSelection:true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true},
        {headerName: 'Name', field: 'testInstanceName', sortable: true, filter: true, resizable: true, width: 300},
        {headerName: 'Description', field: 'testInstanceDescription', sortable: true, filter: true, resizable: true, width: 100},
        {headerName: 'Id', field: '_id', sortable: true, filter: true, resizable: true, width: 200, editable: true},
        {headerName: 'Test Definition', field: 'testDefinitionId.testName', sortable: true, filter: true, resizable: true}
        
      ];

    public selectedRows;
    public hasSelectedRows;
    public selectedSingleRow;
    private gridApi;
    private gridColumnApi;
    public selectedUnlockedRows;
    public rowData;

    public gridOptions: GridOptions;

    
    public params;

    private subscriptions: Subscription[] = [];

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(

        private router: Router,
        private viewRef: ViewContainerRef,
        private testInstance: TestInstanceService,
        private modal: MatDialog,
        private schedulingService: SchedulingService,
        private snack: MatSnackBar,
        private route: ActivatedRoute,
        private testDefinitionService: TestDefinitionService,
        private _execute: ExecuteService,
        private _groups: GroupService
    ) {  }

    ngOnInit() {
        
        this.setComponentData(this._groups.getGroup());

        this.subscriptions.push(this._groups.groupChange().subscribe(group => {
            this.setComponentData(group);
            
        }));

        // this.subscriptions.push(this._groups.groupChange().subscribe( group => {
        //     if(!group["_id"]){
        //         this.setComponentData(this._groups.getGroup());
        //     }
        //     this.setComponentData(group);
        // }));


        this.route.queryParams.subscribe( params => {
           
            this.params = params;


        });


    }

    setComponentData(group) {

        if(!group){
            return;
        }
        this.loading = true;
        let params = {
            groupId: group['_id'],
            $limit: -1,
            $populate: ['testDefinitionId'],
            $sort: {
                createdAt: -1
            },
            $select: ['testInstanceName', 'testInstanceDescription', 'testDefinitionId.testName', 'disabled']
        }

        if (this.route.snapshot.params['filter']) {
            params['_id'] = this.route.snapshot.params['filter'];
        }

        this.testInstance.find(params).subscribe((list) => {
            this.resultsLength = list['length'];
            this.loading = false;
            this.rowData = list;
        },
        err => {
            console.log(err);
        });
        
    }

    ngAfterViewInit() {
   
    }

    ngOnDestroy() {
        this.subscriptions.forEach(e => e.unsubscribe());
    }


    schedule() {
        this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testInstanceName, testDefinitionId}) => ({_id, testInstanceName, testDefinitionId}));
        console.log("The new element is: "+JSON.stringify(this.selectedRows[0]._id));
        
        console.log("Here is the selected Row: "+JSON.stringify(this.gridApi.getSelectedRows()[0]));
        const dialogRef = this.modal.open(ScheduleTestModalComponent, {
            width: '90%',
            data: {
                id: this.selectedRows[0]._id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            /*if(result != ''){
              this.test_instance_selected = result;
              this.strategy_selected = true;
            }else{
              this.strategy_selected = false;
            }*/
        });
    }

    executeMultipleTestInstance(){
        for(let i = 0; i < this.gridApi.getSelectedNodes().length; i++){
            this.executeTestInstance(i);
        }
    }

    executeTestInstance(ti) {
        
        this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testInstanceName, testDefinitionId}) => ({_id, testInstanceName, testDefinitionId}));


        if (this.selectedRows[ti].testDefinitionId) {
            const executer = this.modal.open(AlertModalComponent, {
                width: '250px',
                data: {
                    type: 'confirmation',
                    message: 'Are you sure you want to run ' + this.selectedRows[ti].testInstanceName + '?'
                }
            });

            executer.afterClosed().subscribe(result => {
                if (result) {
                    this._execute.create({
                        _id: this.selectedRows[ti]._id,
                        async: true
                    }).subscribe((result) => {
                        console.log(result);
                        if (result) {
                            this.snack.openFromComponent(AlertSnackbarComponent, {
                                duration: 1500,
                                data: {
                                    message: 'Test Instance Executed'
                                }
                            });
                        }
                    },
                        (error) => {
                            console.log(error);
                            this.modal.open(AlertModalComponent, {
                                width: '450px',
                                data: {
                                    type: 'Alert',
                                    message: 'Failed to execute Test Instance!\n' + JSON.stringify(error)
                                }
                            });
                        })
                }
            });
        }

    }

    createTestInstance() {
        const create = this.modal.open(TestInstanceModalComponent, {
            width: '90%',
            data: null,
            disableClose: true
        });

        create.afterClosed().subscribe(result => {
          this.ngOnInit();
        });
    }


    editTestInstance() {
        this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testInstanceName}) => ({_id, testInstanceName}));

        const edit = this.modal.open(TestInstanceModalComponent, {
            data: {
                ti: this.selectedRows[0]._id,
                isEdit: true
            },
            width: '90%',
            disableClose: true
        });

        edit.afterClosed().subscribe(result => {

        });
    }

    cloneTestInstance() {
        this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testInstanceName}) => ({_id, testInstanceName}));
        this.testInstance.get(this.selectedRows[0]._id).subscribe(
            result => {
                var temp = Object.assign({}, result);
                delete result['_id'];
                delete result['createdAt'];
                delete result['updatedAt'];
                if (this.selectedRows[0].testInstanceName) {
                    result['testInstanceName'] = this.selectedRows[0].testInstanceName + '_Clone';
                } else {
                    result['testInstanceName'] = result['testInstanceName'] + '_Clone';
                }
                this.testInstance.create(result).subscribe(
                    resp => {
                        //this.editTestInstance(resp);
                        this.editTestInstance();
                    },
                    err => {
                        if (err) {
                      
                            result['_id'] = temp['_id'];
                           
                            //this.cloneTestInstance(result);
                        }
                    }
                );
            }
        )
    }

    deleteMultipleTestInstance(){
        for(let i = 0; i < this.gridApi.getSelectedNodes().length; i++){
            this.deleteTestInstance(i);
        }
    }

    deleteTestInstance(ti) {
        this.selectedRows = this.gridApi.getSelectedRows().map(({_id, testInstanceName}) => ({_id, testInstanceName}));


        const deleter = this.modal.open(AlertModalComponent, {
            width: '250px',
            data: {
                type: 'confirmation',
                message: 'Are you sure you want to delete ' + this.selectedRows[ti].testInstanceName + ' ? Executions of this instance will no longer display everything.'
            }
        });

        deleter.afterClosed().subscribe(result => {
            if (result) {
                this.testInstance.delete(this.selectedRows[ti]._id).subscribe(response => {
                    this.snack.openFromComponent(AlertSnackbarComponent, {
                        duration: 1500,
                        data: {
                            message: 'Test Instance Deleted'
                        }
                    });

                });
                this.setComponentData(this._groups.getGroup());
            }
        });
        
    }


    disabledIndicator(params){
        if (params.value){
          return `<mat-icon class="mat-icon mat-icon-no-color" role="img" >
           locked</mat-icon>`;   
    }

 
    }

    setParams(element) {
   
        if (JSON.stringify(element) == JSON.stringify({testInstanceId: this.params.testInstanceId})){
            element = {};
        }

        
        this.router.navigate([], {
           //queryParams: {testInstanceId: element.testInstanceId, page: this.paginator.pageIndex, instancePerPage: this.paginator.pageSize }
            queryParams: {testInstanceId: element._id}
        })
           
    }

    onGridReady(params){
        this.gridApi = params.api;
        console.log(params.columnApi.autoSizeColumns)
        this.gridColumnApi = params.columnApi;
    
        //auto size the column widths
        this.gridColumnApi.autoSizeColumns(['name']);

      }

      selectActiveInstance($event){
        if(this.params.testInstanceId)
        {
            this.gridApi.forEachNode( (node, index) => {

                if(node.data._id ==this.params.testInstanceId)
                {
                    // Pre selects the row that was last selected when on the page
                    node.setSelected(true, true);
                    //Vertically scrolls to that row so it is visible
                    this.gridApi.ensureIndexVisible(index, "middle");
                    
                }
              
            });
        }
        
      }


    onRowSelected(event){

        this.selectedRows = this.gridApi.getSelectedRows().map(({ _id, disabled, testInstanceName  }) => ({ _id, disabled, testInstanceName}));


        
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
        }
        else{
          this.hasSelectedRows = false;
          this.selectedUnlockedRows = false;
          
          this.setParams({_id: null});
        }

        
        //One Row was selected
        if((event.api.getSelectedNodes().length == 1)){
          this.selectedSingleRow = true;
         
          this.setParams({_id: this.selectedRows[0]._id});
         
        }else{
          this.selectedSingleRow = false;
          this.setParams({_id: null});
        }
       
    }



      



    
}

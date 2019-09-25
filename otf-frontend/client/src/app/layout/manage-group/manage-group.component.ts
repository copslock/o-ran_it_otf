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


import { Component, OnInit } from '@angular/core';
import { GroupService } from 'app/shared/services/group.service';
import { UserService } from 'app/shared/services/user.service';
import { routerTransition } from '../../router.animations';
import { MatDialog } from '@angular/material';
import { UserSelectComponent } from 'app/shared/modules/user-select/user-select.component';
import { MulticastOperator } from 'rxjs/internal/operators/multicast';
import { forEach } from '@angular/router/src/utils/collection';
import { OnboardMechidComponent } from 'app/shared/modules/onboard-mechid/onboard-mechid.component';
import { DropdownMultiselectComponent } from './dropdown-multiselect.component';
import { TabbedLayout } from 'ag-grid-community';
import value from '*.json';
import { take } from 'rxjs/operators';
import { object } from '@amcharts/amcharts4/core';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';


@Component({
  selector: 'app-manage-group',
  templateUrl: './manage-group.component.pug',
  styleUrls: ['./manage-group.component.scss'],
  animations: [routerTransition()]
})
export class ManageGroupComponent implements OnInit {

  public group;
  public loading = false;
  public users;
  public tableData; 
  public hasMembers = false;
  public hasSelectedRows = false;
  private gridApi;
  private gridColumnApi;
  public memberTable;
  public rowData;
  public multipleRowsSelected = false;
 

  public columnDefs = [
    { headerName: 'First Name', field: 'firstName', sortable: true, sort: "asc", filter: true, checkboxSelection: true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true},
    { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true },
    { headerName: 'Email', field: 'email', sortable: true, filter: true },
    { headerName: 'Roles', field:'roles', sortable: true, filter: true, editable: true, cellEditor: "DropdownMultiselectComponent", cellEditorParams: function (params) {
        return {
            roles: params.roles,
            userId: params._id
        };
    }
    },
  ];

  constructor(private groupService: GroupService, private userService: UserService, private modal: MatDialog,) { }

  ngOnInit() {
    this.group = {};
    //this.tableData = [];
    this.group = this.groupService.getGroup();
   
    
    this.groupService.groupChange().subscribe(group => {
      this.tableData = undefined;
      this.rowData = undefined;
      this.setComponentData(group);
    });

    this.groupService.get(this.group._id).subscribe((res) => {
      this.group = res;
      this.setComponentData(this.group);
    });

    
  }

  openUserSelect(){
    this.modal.open(UserSelectComponent, {
      width: "500px",
      data: {
          groupId: this.group._id
      }
    }).afterClosed().subscribe((response) => {
      this.groupService.get(this.group._id).subscribe((res) => {
        this.group = res;
        this.setComponentData(this.group);
      });

    });
    
      
  }

  onboardMechid(){
    this.modal.open(OnboardMechidComponent, {
      width: "500px",
      data: {
          groupId: this.group._id
      }
    }).afterClosed().subscribe((response) => {

    });
  }

  removeMembers(){
    let membersToRemove = this.gridApi.getSelectedRows().map(({_id}) => ({_id}));
    this.group.members = this.group.members.filter(member => membersToRemove.filter(user => member.userId.toString() == user._id.toString()).length <= 0); 
    let groupPatch = {
      _id : this.group._id,
      members: this.group.members
    }
    //removes the members from the group
    this.groupService.patch(groupPatch).subscribe(
      (res) => {
        this.gridApi.deselectAll();
        this.tableData = this.tableData.filter(member => membersToRemove.filter(user => member._id.toString() == user._id.toString()).length <= 0);
        this.rowData = Object.assign([], this.tableData);
      }, 
      (err) => {
        this.modal.open(AlertModalComponent, {
          data: {
            type: "alert",
            message: "The was an error removing the user. " + err
          }
        });
    });
    
  }

  setComponentData(group){
    this.gridApi.deselectAll();
    if(!group){
      return;
    }
    this.loading = true;
    this.group = group;
    this.users = [];
    //this.tableData = [];
    //console.log("Running Data")
    this.hasMembers = true;
    this.columnDefs[this.columnDefs.length-1]["cellEditorParams"]["values"] = this.group.roles;
    if(this.group.members){
      
      //console.log(this.group)
      for(let i = 0; i < this.group.members.length; i++){
        let temp = this.group.members[i]["userId"];
        this.userService.get(temp).subscribe(
        (res) => {
          let member = res;
          member["roles"] = this.group.members[i].roles.join();
          if(!this.tableData){
            this.tableData = [];
          }
          if(this.tableData.filter(user => user['_id'].toString() == member["_id"].toString()).length <= 0){
            this.tableData.push(member);
          }else{
            this.tableData = this.tableData.filter(user => user['_id'].toString() != member["_id"].toString())
            this.tableData.push(member);
          }
         // console.log(this.tableData);
          this.rowData = Object.assign([], this.tableData);
        });
        
        
      }
    }else{
      this.hasMembers = false;
    }
    
    
    //need to either populate user or pull each user's info
    //this.rowData = this.tableData;
    //console.log(this.rowData);
  }

  editRoles(){
    //console.log(this.tableData);
    this.gridApi.refreshCells();
    let memberToEdit = this.gridApi.getSelectedRows().map(({_id}) => ({_id}));
    this.modal.open(DropdownMultiselectComponent, {
      width: "500px",
      data : { 
        user : memberToEdit,
        group: this.group
      }
    }).afterClosed().subscribe((res) => {
      this.groupService.get(this.group._id).subscribe((res) => {
        this.group = res;
        this.setComponentData(this.group);
      });
    })
  }

  onCellClicked(event) {
    //console.log(event.colDef.field)
  }

  onRowSelected(event){
    if(event.api.getSelectedNodes().length > 0){
      this.hasSelectedRows = true;
      if(event.api.getSelectedNodes().length > 1){
        this.multipleRowsSelected = true;
      }else{
        this.multipleRowsSelected = false;
      }
    }else{
      this.hasSelectedRows = false;
      this.multipleRowsSelected = false;
    }
  }

  onGridReady(params){
    this.gridApi = params.api;
    //console.log(params.columnApi.autoSizeColumns)
    this.gridColumnApi = params.columnApi;

    //auto size the column widths
    this.gridColumnApi.autoSizeColumns(['name']);
  }

}

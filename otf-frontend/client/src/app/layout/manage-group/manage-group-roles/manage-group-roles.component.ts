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
import { routerLeftTransition } from 'app/router.animations';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from 'app/shared/services/group.service';
import { CookieService } from 'ngx-cookie-service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import {AlertModalComponent} from '../../../shared/modules/alert-modal/alert-modal.component';
import { NEXT } from '@angular/core/src/render3/interfaces/view';
import { convertPropertyBindingBuiltins } from '@angular/compiler/src/compiler_util/expression_converter';
import { extractDirectiveDef } from '@angular/core/src/render3/definition';
import { take } from 'rxjs/operators';





@Component({
  selector: 'app-manage-group-roles',
  templateUrl: './manage-group-roles.component.pug',
  styleUrls: ['./manage-group-roles.component.scss'],
  animations: [routerLeftTransition()]
})

export class ManageGroupRolesComponent implements OnInit {


  public selectedGroup;
  public groupRoles;
  public roleName = null;
  public loading = false;
  public groupPermissions;
  public element = {};
  public groupName;

  public dataSource;
  public displayedColumns;
  public readPermission = false;
  public writePermission = false;
  public executePermission = false;
  public deletePermission = false;
  public managementPermission = false;

  



  constructor(
    public _groups: GroupService,
    private cookie: CookieService,
    private modal: MatDialog,
    private ResponseMatDialog: MatDialog
    
  ) { 

    
  }

  ngOnInit() {

    this.setComponentData(this._groups.getGroup());
    this._groups.groupChange().subscribe(group => {
      this.setComponentData(group);

    });


  }

  setComponentData(group) {
    if(!group){
      return;
    }
    this.groupName = group.groupName;
    this.loading = true;
    this.dataSource = new MatTableDataSource();
    this._groups.find({ 
      $limit: -1,
      _id: group['_id'], 
      $select: ['_id', 'roles']
    }).subscribe((res) => {

      this.selectedGroup = res[0];
      this.groupRoles = res[0].roles;

      //If current group does not have any roles
      if ( (this.groupRoles == null) || (this.groupRoles.length < 1))
      {
        this.groupRoles = [
          {roleName: "admin", permissions: "read, write, execute, delete, management"},
          {roleName: "user", permissions: "read"},
          {roleName: "developer", permissions: "read, write, execute, delete"}
        ];
        
      }


      for (let i = 0; i < this.groupRoles.length; i++){
        this.groupRoles[i].readPermission = false;
        this.groupRoles[i].writePermission = false;
        this.groupRoles[i].executePermission = false;
        this.groupRoles[i].deletePermission = false;
        this.groupRoles[i].managementPermission = false;
        if (this.groupRoles[i].permissions.includes('read')){
          this.groupRoles[i].readPermission = true;
        }
        if (this.groupRoles[i].permissions.includes('write')){
          this.groupRoles[i].writePermission = true;
        }
        if (this.groupRoles[i].permissions.includes('execute')){
          this.groupRoles[i].executePermission = true;
        }
        if (this.groupRoles[i].permissions.includes('delete')){
          this.groupRoles[i].deletePermission = true;
        }
        if (this.groupRoles[i].permissions.includes('management')){
          this.groupRoles[i].managementPermission = true;
        }
      }
     
      this.dataSource.data = this.groupRoles;
      this.loading = false;
      this.update();

      


    })

    this.displayedColumns = ['roleName', 'read', 'write', 'execute', 'delete', 'management', 'actions']

  }


  async create(){
    
    for (let i = 0; i < this.groupRoles.length; i++){
      if (this.groupRoles[i].roleName == this.roleName){
        this.sendFeedbackAlert('warning', 'Please do not add a duplicate role name.');
        return;
      }
    }
  
      this.groupRoles.push({roleName: this.roleName, readPermission: true, writePermission: false, executePermission: false, deletePermission: false, managementPermission: false});
      await this.update();
      this.setComponentData(this._groups.getGroup());
  

  }

  async update(){
  
    
    for (let i = 0; i < this.groupRoles.length; i++) {
      this.groupRoles[i].permissions = [];
      if(this.groupRoles[i].readPermission){
        this.groupRoles[i].permissions.push('read');
      }
      if(this.groupRoles[i].writePermission){
        this.groupRoles[i].permissions.push('write');
      }
      if(this.groupRoles[i].executePermission){
        this.groupRoles[i].permissions.push('execute');
      }
      if(this.groupRoles[i].deletePermission){
        this.groupRoles[i].permissions.push('delete');
      }
      if(this.groupRoles[i].managementPermission){
        this.groupRoles[i].permissions.push('management');
      }

    }
      
    this.groupPermissions = this.groupRoles.map(({ roleName, permissions }) => ({roleName, permissions}));
   
    let groupPatch = {
      '_id': this.selectedGroup._id,
      'roles': this.groupPermissions
    };
    //console.log(groupPatch);
    await this._groups.patch(groupPatch).pipe(take(1)).toPromise();

      

  }

  async deleteRole(element){

    for (let i = 0; i < this.groupRoles.length; i++){
        if (this.groupRoles[i].roleName == element.roleName){
          this.groupRoles.splice(i, 1);
          break;
        }
    }
    await this.update();
    this.setComponentData(this._groups.getGroup());




  }

  public sendFeedbackAlert(type: string, message: string) {
    this.ResponseMatDialog.open(AlertModalComponent, {
        width: '250px',
        data: {
            type: type,
            message: message
        }
    });
  }








 






}

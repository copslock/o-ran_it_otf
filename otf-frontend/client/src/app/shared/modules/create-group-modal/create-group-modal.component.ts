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


import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { GroupService } from 'app/shared/services/group.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'app/shared/services/user.service';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';


@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.pug',
  styleUrls: ['./create-group-modal.component.scss']
})
export class CreateGroupModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CreateGroupModalComponent>, @Inject(MAT_DIALOG_DATA) public input_data, private userService: UserService, private groupService: GroupService, private cookieService: CookieService, private snack: MatSnackBar, private modal: MatDialog) { }

  public groups;
  public newGroup;
  public user;

  ngOnInit() {
    this.newGroup = {};
    this.user = {};
    this.groups = [];
    this.newGroup.groupName = '';
    this.newGroup.parentGroupId = null;
    this.user._id = this.userService.getId();
    this.newGroup.ownerId = this.user["_id"];
    //filter list of groups by the Admin permssion from the user
    //Also add group onto active dropdown list when this dialog is closed
    this.groupService.find({
      $limit: -1
      
    }).subscribe((list) => {
      //console.log(list);
      for(let i in list){
        //console.log(this.user._id + "     " + list[i]);
        if(this.checkIsAdmin(list[i], this.user._id)){
          this.groups.push(list[i]);
        }
      }
      
    });

  }

  checkIsAdmin(group, userId){
    if(group.members){
      let memberIndex =  group.members.findIndex(function(member){return member.userId.toString() == userId.toString()});
      if(memberIndex >= 0){
        if(group.members[memberIndex].roles.includes("admin")){
          return true;
        }
      }
    }
    return false;
  }

  close(){
    
    this.dialogRef.close(null);
  }

  createGroup(){
    
    //console.log(this.newGroup);
    if(this.newGroup.parentGroupId == "None"){
      this.newGroup.parentGroupId = null;
    }
    
    this.newGroup.roles = [{
      roleName: "admin",
      permissions: ["management", "write", "delete", "read", "execute"]
    },
    {
      roleName: "user",
      permissions: ["read"]
    },
    {
      roleName: "developer",
      permissions: ["write", "delete", "read", "execute"]
    }];
    this.newGroup.members = [{
      userId: this.user._id,
      roles: ["admin"]
    }];
    this.groupService.create(this.newGroup).subscribe(res => { 
      
      let snackMessage = 'The group ' + this.newGroup.groupName + " has been created!";
      this.snack.openFromComponent(AlertSnackbarComponent, {
          duration: 1500,
          data: {
              message: snackMessage
          }
      });
      if(res){
        this.dialogRef.close(res)
      }else{
        this.close();
      }
    }, (error) => {
        this.modal.open(AlertModalComponent, {
          width: "250px",
          data: {
              type: "alert",
              message: error
          }
        });
    }); 
    
  }

}

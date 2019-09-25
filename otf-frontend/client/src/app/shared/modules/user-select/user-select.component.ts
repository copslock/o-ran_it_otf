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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserService } from 'app/shared/services/user.service';
import { GroupService } from 'app/shared/services/group.service';

@Component({
  selector: 'app-user-select',
  templateUrl: './user-select.component.pug',
  styleUrls: ['./user-select.component.scss']
})
export class UserSelectComponent implements OnInit {

  
  public data; 
  public users; 
  public group;
  public search;
  public selectedUsers;

  constructor(
    public dialogRef: MatDialogRef<UserSelectComponent>,
    private userService: UserService,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) {
    this.data = {};
   }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  selectUser(user){
    //this.unselectUser();
    if(user.isSelected){
      this.selectedUsers.push(user);
    }else{
      //user.isSelected = false;
      this.unselectUser(user);
    }
    

  }

  unselectUser(user){
    // this.selectedUsers = this.selectedUsers.filter(user => user.isSelected);
    this.selectedUsers.splice(this.selectedUsers.findIndex(function(userN){ return userN._id.toString() === user._id.toString(); }), 1);
    
  }

  addUsers(){
    let usersToAdd = this.selectedUsers;

    //filters users that are already in the group to avoid duplicates
    if(this.group.members){
      usersToAdd = this.selectedUsers.filter(user =>
        this.group.members.filter(member => member.userId.toString() == user._id.toString()).length <= 0
      );
    }
   
    //populates the users roles and userId field
    for(let i = 0; i < usersToAdd.length; i++){
        usersToAdd[i] = {
          userId : usersToAdd[i]._id,
          roles : ["user"]
        }
    }
    //sets up patch object
 
    let groupPatch = {
      _id : this.input_data.groupId,
      $push : { members: { $each : usersToAdd } }
      
    }
    this.groupService.patch(groupPatch).subscribe((results) => {
      this.dialogRef.close(usersToAdd);
    });
    
  }

  ngOnInit() {
    this.users = [];
    this.selectedUsers = [];
    this.userService.find({$limit: -1, $select: ['firstName', 'lastName', 'email']})
      .subscribe(
        (result) => {
            this.users = result;
        },
        (error) => {
            console.log(error);
      });
      this.groupService.get(this.input_data.groupId).subscribe((res) => {
        this.group = res;
      })
    
    this.search = {};
    this.search.email = ""; 
    this.input_data.testDefinition = {};
  }

}

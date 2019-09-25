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
import { GroupService } from 'app/shared/services/group.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'app/shared/services/user.service';


@Component({
  selector: 'app-dropdown-multiselect',
  templateUrl: './dropdown-multiselect.component.pug',
  styleUrls: ['./dropdown-multiselect.component.scss']
})
export class DropdownMultiselectComponent implements OnInit {

  public group;
  public memberRoles;
  private params;
  public roles;
  public user;
  public userId;
  public search;
  constructor(private groupService: GroupService, public dialogRef: MatDialogRef<DropdownMultiselectComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public input_data
  ) {
   
   }

  ngOnInit() {
    this.search = {};
    this.userId = this.input_data["user"][0]["_id"];
    this.group = this.input_data["group"];
    this.memberRoles = this.group["members"].filter(member => member.userId == this.userId)["roles"];
    this.userService.get(this.userId).subscribe((result) => {
      this.user = result;
    });
    this.roles = this.group.roles;
    
    this.memberRoles = this.group.members.filter(member => member.userId.toString() == this.userId.toString())[0].roles;
    if(this.memberRoles){
      for(let i = 0; i < this.roles.length; i++){
        this.roles[i].isSelected = false;
        for(let j = 0; j < this.memberRoles.length; j++){
          if(this.roles[i].roleName == this.memberRoles[j]){
            this.roles[i].isSelected = true;
          }
        }
      }
    }
  }

  saveRoles(){
    let member = {
      userId : this.userId,
      roles : []
    }
    
    member.roles = this.roles.filter(role => role.isSelected).map(item => {return item.roleName});
    
    // the logic to remove the one member from the array of members and then push the new member roles
    this.groupService.get(this.group._id).subscribe((res) => {
      let group = res;
      
      let newMembers = [];
      if(group["members"]){
        newMembers = group["members"].filter(member => member.userId.toString() != this.userId.toString());
      }
      newMembers.push(member)
      let groupPatch = {
        _id : this.group._id,
        members : newMembers
      }
      this.groupService.patch(groupPatch).subscribe((response) => {
        this.dialogRef.close();
      });
    });
    
    
  }

}

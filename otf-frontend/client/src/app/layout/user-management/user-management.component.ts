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


import {Component, OnInit, ViewContainerRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { MatPaginator, MatDialog, MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../shared/services/user.service";
import { routerTransition } from '../../router.animations';
import { ListService } from '../../shared/services/list.service';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { GroupService } from 'app/shared/services/group.service';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';
import * as organizeGroups from '../../../../../server/src/feathers/hooks/permissions/get-permissions';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.pug',
  styleUrls: ['./user-management.component.scss'],
  animations: [routerTransition()]

})
export class UserManagementComponent implements OnInit {

    public dataSource;
    public displayedColumns: string[] = ['lastName', 'firstName', 'email', 'addGroups', 'isVerified', 'enabled'];
    public resultsLength;
    public loading = false;
    public filterString = "";
    public groups;
    public search;
    public currentUser;
    
    @ViewChild(MatPaginator) paginator: MatPaginator;


    constructor(private http: HttpClient,
        private router: Router,
        private viewRef: ViewContainerRef,
        private list: ListService,
        private modal: MatDialog,
        private snack: MatSnackBar,
        private user: UserService,
        private route: ActivatedRoute,
        private groupService: GroupService,
        private cookie: CookieService
    ) { }

    ngOnInit() {
        this.loading = true;
        this.groups = [];
        this.search = {};
        this.search.groupName = '';
        this.currentUser = JSON.parse(this.cookie.get('currentUser'));
        this.groupService.find({$limit: -1}).subscribe((result) => {
            if(result){
                this.groups = organizeGroups(this.currentUser, result);
                
            }
        })
        this.route.queryParamMap.subscribe(queryParams => {
            this.filterString = queryParams.get("filter");
            if(!this.filterString){
                this.filterString = "";
            }
        });
        this.list.createList('td');
        //["$limit=-1", "$sort[createdAt]=-1", "$select[]=lastName", "$select[]=firstName", "$select[]=email", "$select[]=isVerified", "$select[]=enabled"]
        this.user.find({
            $limit: -1,
            $sort: {
                createdAt: -1,
            },
            $select: ['lastName', 'firstName', 'email', 'isVerified', 'enabled', 'groups']
        }).subscribe((list) => {
            this.list.changeMessage('td', list);
            this.loading = false;

        });

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.paginator;

        this.list.listMap['td'].currentList.subscribe((list) =>{
            if(list){
                this.dataSource.data = list;
                this.resultsLength = this.dataSource.data.length;
                this.applyFilter(this.filterString)
            }
        });

    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    applyGroupFilter(filterValue: string){
        this.groups.filter = filterValue.trim().toLowerCase();
    }

    dropdownChange(){
        this.search.groupName = '';
        for(let i in this.groups){
            this.groups[i].selected = false;
        }
        
    }

    
    addRemoveGroupList(element, groupId, event){
        if(event.checked){
            if (element.groupsToAddRemove){
                element.groupsToAddRemove.push(groupId);
            }else{
                element.groupsToAddRemove = [];
                element.groupsToAddRemove.push(groupId);
            }
        }else{
            if(element.groupsToAddRemove){
                let temp = element.groupsToAddRemove.indexOf(groupId)
                if(temp >= 0)
                    element.groupsToAddRemove.splice(temp, 1);
            }
        }
        
    }

    removeGroups(user){
        this.modal.open(AlertModalComponent, {
            width: "250px",
            data: {
                type: "confirmation",
                message: "Are you sure you want to remove " + user.firstName + " " + user.lastName + " from groups?"
            }
        }).afterClosed().subscribe((results) => {
            if(results === undefined){
                return;
            }
            if(results){
                for(let i in user.groupsToAddRemove){
                    user[user.groupsToAddRemove[i]] = false;
                    let index = this.groups.findIndex(function(group){ return group._id == user.groupsToAddRemove[i]; })
                    if(index >= 0 && this.groups[index].members){
                        let memberIndex = this.groups[index].members.findIndex(function(member){return member.userId.toString() == user._id.toString()})
                        if(memberIndex >= 0){
                            this.groups[index].members.splice(memberIndex, 1);
                            let groupPatch = {
                                _id : this.groups[index]._id,
                                members: this.groups[index].members
                            }
                            this.groupService.patch(groupPatch).subscribe((res) => {
                                let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' removed from group!';
                                this.snack.openFromComponent(AlertSnackbarComponent, {
                                    duration: 1500,
                                    data: {
                                        message: snackMessage
                                    }
                                });
                            });   
                        }
                    }
                  
                }
            }else{
                return;
            }
            // let userPatch = {
            //     _id : user._id,
            //     groups: user.groups
            // };

            // this.user.patch(userPatch).subscribe((res) => {
            //     let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' removed from group!';
            //     this.snack.openFromComponent(AlertSnackbarComponent, {
            //         duration: 1500,
            //         data: {
            //             message: snackMessage
            //         }
            //     })
            // });
            user.groupsToAddRemove = [];
            
        });
    }
    //add "Change Groups" header to management dropdown\
    addGroups(user){
        this.modal.open(AlertModalComponent, {
            width: "250px",
            data: {
                type: "userAdmin",
                message: "Would you like to add as group user or group admin?"
            }
        }).afterClosed().subscribe((results) => {
            if(results === undefined){
                return;
            }
            if(results){
                for(let i in user.groupsToAddRemove){
                    user[user.groupsToAddRemove[i]] = false;
                    let groupPatch = {
                        _id : user.groupsToAddRemove[i],
                        $push: { members: { userId : user._id, roles: ["admin"]}}
                    }
                    

                    let index = this.groups.findIndex(function(group){ return group._id == user.groupsToAddRemove[i]; })
                    if(index >= 0 && this.groups[index].members){
                        let memberIndex = this.groups[index].members.findIndex(function(member){return member.userId.toString() == user._id.toString()});
                        
                        if(memberIndex >= 0 && !this.groups[index].members[memberIndex]["roles"].includes("admin")){
                            groupPatch = this.groups[index];
                            groupPatch["members"][memberIndex].roles.push("admin");
                        }else if (memberIndex < 0) {
                            groupPatch = {
                                _id : user.groupsToAddRemove[i],
                                $push: { members: { userId : user._id, roles: ["admin"]}}
                            }
                        }else{
                            let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' already group admin!';
                            this.snack.openFromComponent(AlertSnackbarComponent, {
                                duration: 1500,
                                data: {
                                    message: snackMessage
                                }
                            });
                            continue;
                        }
                    }
                    this.groupService.patch(groupPatch).subscribe((res) => {
                        let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' added to group!';
                        this.snack.openFromComponent(AlertSnackbarComponent, {
                            duration: 1500,
                            data: {
                                message: snackMessage
                            }
                        });
                    });   
                   
                }
            }else{
                for(let i in user.groupsToAddRemove){
                    user[user.groupsToAddRemove[i]] = false;
                    let groupPatch = {
                        _id : user.groupsToAddRemove[i],
                        $push: { members: { userId : user._id, roles: [""]}}
                    }
                    

                    let index = this.groups.findIndex(function(group){ return group._id == user.groupsToAddRemove[i]; })
                    if(index >= 0 && this.groups[index].members){
                        let memberIndex = this.groups[index].members.findIndex(function(member){return member.userId == user.groupsToAddRemove[i]})
                        if(memberIndex >= 0 ){
                            if( this.groups[index].members[memberIndex].roles.includes("admin")){
                                groupPatch = this.groups[index];
                                let adminIndex = groupPatch["members"][memberIndex].roles.findIndex(function(perm){return perm.toLowerCase() == "admin";});
                                groupPatch["members"][memberIndex].roles.splice(adminIndex, 1);
                            }else{
                                return;
                            }
                        }else if (memberIndex < 0) {
                            groupPatch = {
                                _id : user.groupsToAddRemove[i],
                                $push: { members: { userId : user._id, roles: [""]}}
                            }
                        }
                    }
                    this.groupService.patch(groupPatch).subscribe((res) => {
                        let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' added to group!';
                        this.snack.openFromComponent(AlertSnackbarComponent, {
                            duration: 1500,
                            data: {
                                message: snackMessage
                            }
                        });
                    });  
                }
            }
            // let userPatch = {
            //     _id : user._id,
            //     groups: user.groups
            // };

            // this.user.patch(userPatch).subscribe((res) => {
            //     let snackMessage = 'Success. ' + user.firstName + ' ' + user.lastName + ' added to group!';
            //     this.snack.openFromComponent(AlertSnackbarComponent, {
            //         duration: 1500,
            //         data: {
            //             message: snackMessage
            //         }
            //     })
            // });
            user.groupsToAddRemove = [];
           
        });

        
    }

    enableUser(event, element){
        console.log(element)
        let oldVal = element.enabled;
        if(event.target.checked === element.enabled){
            //console.log("same");
            return
        }
        this.user.enableUser(element._id, event.target.checked).subscribe(
            (result) => {
                element.enabled = result['enabled'];
                let snackMessage = 'Success. Set enabled to : ' + result['enabled'];
                this.snack.openFromComponent(AlertSnackbarComponent, {
                    duration: 1500,
                    data: {
                        message: snackMessage
                    }
                })

            },
            (error) => {
                element.enabled = oldVal;
                let snackMessage = 'Could not set enabled to : ' + !oldVal;
                this.snack.open(snackMessage, "Error", { duration: 1500 })


            }

        )


    }

}

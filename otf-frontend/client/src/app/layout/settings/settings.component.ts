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
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'app/shared/services/user.service';
import { GroupService } from 'app/shared/services/group.service';
import { routerTransition } from 'app/router.animations';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { Group } from 'app/shared/models/group.model';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.pug',
  styleUrls: ['./settings.component.scss'],
  animations: [routerTransition()]
})

export class SettingsComponent implements OnInit {
  defaultGroupEnabled = false;
  private defaultGroup;
  private eligibleGroups;
  private currentUser;
  private defaultGroupId;

  constructor(private cookie: CookieService,
    private user: UserService,
    private _group: GroupService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {

    this.currentUser = JSON.parse(this.cookie.get('currentUser'));

    this._group.find({ $limit: -1 }).subscribe((result) => {
      if (result)
        this.eligibleGroups = result;
    });

    this.user.get(this.currentUser._id).subscribe((result) => {
      if (result)
        this.defaultGroupId = result['defaultGroup'];
        this.defaultGroupEnabled = result['defaultGroupEnabled'];

        this._group.get(this.defaultGroupId).subscribe((result) => {
        this.defaultGroup = result;
      });
    });
  }

  changDefaultGroup(group: Group) {
    this.defaultGroup = group;
  }

  enableDefaultGroup() {
    this.defaultGroupEnabled = true;
  }

  disableDefaultGroup() {
    this.defaultGroupEnabled = false;
    
  }

  update() {

    this.currentUser.defaultGroupEnabled = this.defaultGroupEnabled;
    this.currentUser.defaultGroup = this.defaultGroup;
    this.cookie.set('currentUser', JSON.stringify(this.currentUser));
    

    
    let userPatch = {
      _id: this.currentUser._id,
      defaultGroup: this.defaultGroup._id,
      defaultGroupEnabled: this.defaultGroupEnabled
    };

    this.user.patch(userPatch).subscribe((res) => {
      let snackMessage = 'Successfully Updated Settings';
                this.snack.openFromComponent(AlertSnackbarComponent, {
                    duration: 1500,
                    data: {
                        message: snackMessage
                    }
                })
    })
  }
}

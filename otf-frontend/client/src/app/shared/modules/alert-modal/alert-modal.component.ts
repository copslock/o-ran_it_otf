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


import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef,} from '@angular/material';

@Component({
    selector: 'app-alert-modal',
    templateUrl: './alert-modal.component.pug',
    styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {
    public data;
    public type;
    public html;

    constructor(
        public dialogRef: MatDialogRef<AlertModalComponent>,
        @Inject(MAT_DIALOG_DATA) public input_data
    ) {
        this.data = this.input_data;
        if (this.data.type.match(new RegExp('^warning$', 'i'))) {
            this.type = 'warning';
        } else if (this.data.type.match(new RegExp('^confirmation$', 'i'))) {
            this.type = 'confirmation';
        } else if (this.data.type.match(new RegExp('^alert$', 'i'))) {
            this.type = 'alert';
        } else if (this.data.type.match(new RegExp('^ok$', 'i'))) {
            this.type = 'ok';
        } else if (this.data.type.match(new RegExp('^userAdmin$', 'i'))) {
            this.type = 'userAdmin';
        } else {
            this.type = 'info';
        }
    }

    ngOnInit() {
        if(this.data.html){
            this.html = this.data.html;
        }
    }

    okay() {
        this.dialogRef.close();
    }

    confirmed() {
        this.dialogRef.close(true);
    }

    canceled() {
        this.dialogRef.close(false);
    }
}

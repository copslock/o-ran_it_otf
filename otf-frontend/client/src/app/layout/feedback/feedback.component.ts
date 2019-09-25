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


import {Component, OnInit} from '@angular/core';
import {routerTransition} from 'app/router.animations';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {AlertModalComponent} from '../../shared/modules/alert-modal/alert-modal.component';
import {FeedbackService} from "../../shared/services/feedback.service";

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.pug',
    styleUrls: ['./feedback.component.scss'],
    animations: [routerTransition()]
})
export class FeedbackComponent implements OnInit {
    private firstName: string;
    private lastName: string;
    private email: string;
    private message: string;

    public FeedbackFormGroup: FormGroup;
    private FirstNameFormControl: FormControl;
    private LastNameFormControl: FormControl;
    private EmailFormControl: FormControl;
    private MessageFormControl: FormControl;

    constructor(
        private ResponseMatDialog: MatDialog,
        private feedback: FeedbackService
    ) {
    }


    // @ViewChild('feedbackForm') private FeedBackForm;

    ngOnInit(): void {
        this.createFormControls();
        this.createFormGroup();
    }

    private createFormControls() {
        this.FirstNameFormControl = new FormControl('', [Validators.required]);
        this.LastNameFormControl = new FormControl('', [Validators.required]);
        this.EmailFormControl = new FormControl('', [Validators.required, Validators.email]);
        this.MessageFormControl = new FormControl('', [Validators.required]);
    }

    private createFormGroup() {
        this.FeedbackFormGroup = new FormGroup({
            firstName: this.FirstNameFormControl,
            lastName: this.LastNameFormControl,
            email: this.EmailFormControl,
            message: this.MessageFormControl
        });
    }

    // submit button action
    public onSubmitFeedback() {
        if (!this.FeedbackFormGroup.invalid) {
            // console.log(this.FeedbackFormGroup.getRawValue())
            this.feedback.sendFeedback(this.FeedbackFormGroup.getRawValue()).subscribe(
                (result) => {
                    this.sendFeedbackAlert('ok', 'Feedback sent!');
                },
                (error) => {
                    this.sendFeedbackAlert('warning', 'Please verify form fields are correct.');
                }
            )        }
        else{
            this.sendFeedbackAlert('warning', 'Please verify form fields are correct.');
        }
    }

    private sendFeedbackAlert(type: string, message: string) {
        this.ResponseMatDialog.open(AlertModalComponent, {
            width: '250px',
            data: {
                type: type,
                message: message
            }
        });
    }
}

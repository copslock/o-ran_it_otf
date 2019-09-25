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
import {ActivatedRoute} from "@angular/router";
import {AccountService} from "../shared/services/account.service";
import { Router} from '@angular/router';
import { routerTransition } from '../router.animations';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [routerTransition()]

})
export class AccountComponent implements OnInit {
    private action: string;
    private token: string;
    public message: string;
  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService) { }

  ngOnInit() {
      this.message = "";
      this.action = this.route.snapshot.paramMap.get("action");
      this.route.queryParamMap.subscribe(queryParams => {
          this.token = queryParams.get("token");
      });
      if(this.action && this.token){
          this.accountService.verify(this.token)
              .subscribe(
                  data  => {
                      this.message = "Thanks for verifying your email. You will be notified when your account is enabled by an admin."
                  },
                  error  => {
                      this.router.navigate(['/dashboard']);
                  }
              );
      }
      else{
          this.router.navigate(['/dashboard']);
      }

  }

}

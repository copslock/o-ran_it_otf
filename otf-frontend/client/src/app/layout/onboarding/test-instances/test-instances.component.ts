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


import { Component, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routerLeftTransition } from '../../../router.animations';
import 'codemirror/mode/yaml/yaml.js';

@Component({
  selector: 'app-test-instances',
  templateUrl: './test-instances.component.pug',
  styleUrls: ['./test-instances.component.scss', '../onboarding.component.scss'],
  animations: [routerLeftTransition()]
})
export class TestInstancesComponent implements OnInit {
  yaml;

  public codeConfig = {
    mode: "yaml",
    theme: "eclipse",
    lineNumbers: true
  };

  
  //@Output() public createFormOptions;
  

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   this.createFormOptions = params["testDefinition"];
    // });
    
  }

  // back() {
  //   this.router.navigateByUrl('/onboarding/test-definition');
  // }

  // next() {
  //   this.router.navigateByUrl('/dashboard');
  // }
}
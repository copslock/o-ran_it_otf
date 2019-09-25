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


import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    var loop1, loop2, loop3, time = 30, i = 0, number, selector3 = $('.thirdDigit'), selector2 = $('.secondDigit'),
      selector1 = $('.firstDigit');
    loop3 = setInterval(() => {
      "use strict";
      if (i > 40) {
        clearInterval(loop3);
        selector3.text(4);
      } else {
        selector3.text(this.randomNum());
        i++;
      }
    }, time);
    loop2 = setInterval(() => {
      "use strict";
      if (i > 80) {
        clearInterval(loop2);
        selector2.text(0);
      } else {
        selector2.text(this.randomNum());
        i++;
      }
    }, time);
    loop1 = setInterval( () => {
      "use strict";
      if (i > 100) {
        clearInterval(loop1);
        selector1.text(4);
      } else {
        selector1.text(this.randomNum());
        i++;
      }
    }, time);
  }

  randomNum() {
    "use strict";
    return Math.floor(Math.random() * 9) + 1;
  }

}

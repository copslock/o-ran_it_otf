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


import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

export interface NavItem {
  displayName: string;
  disabled?: boolean;
  iconName?: string;
  route?: string;
  click?: any;
  children?: NavItem[];
}

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.pug',
  styleUrls: ['./menu-item.component.scss']
})

export class MenuItemComponent implements OnInit {

  @Input() items: NavItem[];
  @ViewChild('childMenu') public childMenu;
  @Output() dataEvent = new EventEmitter<any>();

  constructor(public router: Router) { }

  ngOnInit() {
  }

  receiveSelected($event){
    this.sendSelected($event);
  }

  sendSelected(data){
    this.dataEvent.emit(data)
  }

}

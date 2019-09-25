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


import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, NgModule, Compiler, ViewContainerRef, Inject, Sanitizer } from '@angular/core';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { DomSanitizer } from '@angular/platform-browser'
import * as $ from 'jquery';
import 'codemirror/mode/xml/xml.js';



@Component({
  selector: 'app-robot-report',
  templateUrl: './robot-report.component.pug',
  styleUrls: ['./robot-report.component.scss'],
})
export class RobotReportComponent implements OnInit {

  @Input() public response;

  @ViewChild('srcipts') scripts: ElementRef;
  @ViewChild('frame1') frame1: ElementRef;
  @ViewChild('frame2') frame2: ElementRef;
  @ViewChild('codeMirror') codeMirror: ElementRef;

  @ViewChild('container', {read: ViewContainerRef}) public container;

  public reports = {
    log: null,
    report: null,
    output: null
  };

  public codeConfig = {
    mode: "application/xml",
    theme: "eclipse",
    readonly: true,
    lineNumbers: true
  };

  public isRefreshed = false;
  public noClick = "<script>$(document).ready(function(){ $('div a').removeAttr('href');}); $(document).click(function(){$('div a').removeAttr('href');} )</script>";

  constructor(private fileTransfer: FileTransferService, private compiler: Compiler, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if(this.response){
      if(this.response.vthResponse && this.response.vthResponse.resultData){
        let fileId = this.response.vthResponse.resultData.robotResultFileId;
        if(fileId){
          this.fileTransfer.get(fileId, {robot: true}).subscribe(result => {
            this.reports.log = this.sanitizer.bypassSecurityTrustHtml(result['log.html'] + this.noClick);
            this.reports.report = this.sanitizer.bypassSecurityTrustHtml(result['report.html'] + this.noClick);
            this.reports.output = result['output.xml'];
          });
        }
      }
    }

  }

  refresh(){
    this.isRefreshed = false;
    setTimeout(() => {
      this.isRefreshed = true;
    }, 500);
  }

}

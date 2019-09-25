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


import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from 'app/router.animations';
import { ActivatedRoute } from '@angular/router';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import BpmnJS from 'bpmn-js/lib/NavigatedViewer';
import beautify from 'json-beautify';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval } from 'rxjs';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { Buffer } from 'buffer';
import 'codemirror/mode/javascript/javascript.js';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { RequiredValidator } from '@angular/forms';
import { UserService } from 'app/shared/services/user.service';
import { ExecuteService } from 'app/shared/services/execute.service';
import { BpmnFactoryService } from 'app/shared/factories/bpmn-factory.service';
import { Bpmn } from 'app/shared/models/bpmn.model';

//import 'datatables.net';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.pug',
  styleUrls: ['./control-panel.component.scss'],
  animations: [routerTransition(),
  trigger('detailExpand', [
    state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
    state('expanded', style({ height: '*' })),
    transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])
  ]
})
export class ControlPanelComponent implements OnInit, OnDestroy {

  @ViewChild('canvas-card') canvas: ElementRef;

  public params;
  public displayedColumns = ['startTime', 'endTime', 'totalTime'];
  public dataSource = {};
  public instanceDataSource = {};
  public data = {};
  public testHeads = [];
  public testResult;
  public expandedElement;
  public selectedTestHead;
  public selectedTestInstance;
  public objectKeys = Object.keys;
  private pullData = true;
  public showFireworks = false;
  public refreshData = false;
  public spin = false;
  public lastVTHResultsLength = 0;
  // Create an Observable that will publish a value on an interval
  public refreshCounter = interval(5000);

  public isResizing = false;
  public lastDownY;

  public viewer: Bpmn;
  public taskLog = '';

  public executionJobLog = [];
  public executionExternalTaskLog = [];
  public executionVariables = [];

  public executionJobLogDataSource;
  public executionExternalTaskLogDataSource;
  public executionVariablesDataSource;

  public selectedExecutionJobLog;
  public selectedExecutionExternalTaskLog;
  public selectedExecutionVariable;


  public codeConfig = {
    mode: "application/json",
    theme: "eclipse",
    readonly: true,
    lineNumbers: true
  };

  public taskLogConfig = {
    mode: "Shell",
    theme: "3024-night",
    readonly: true
  };

  private processInstanceId;
  public processState;


  constructor(
    private route: ActivatedRoute,
    private executionService: ExecuteService,
    private user: UserService,
    private testExecution: TestExecutionService,
    private fileTransfer: FileTransferService,
    private bpmnFactory: BpmnFactoryService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.params = params;
      if(params.id){
        this.refreshData = false;
        this.populateData();

        this.refreshCounter.subscribe(n => {
          if (this.pullData){
            this.populateData(n + 1);
            this.updateFlowData();

          }
        });
      }
    });

    $('#canvas-card').on('mousedown', (e) => {
      this.isResizing = true;
      this.lastDownY = $('#canvas-card').position().top + $('#canvas-card').outerHeight(true);
    })

    $(document).on('mousemove', (e) => {
      if(!this.isResizing){
        return;
      }

      var bottom = $('#canvas-card').position().top + $('#canvas-card').outerHeight(true);//$('#canvas-card').height() - (e.clientY - $('#canvas-card').offset().top);

      if(bottom != this.lastDownY){
        this.lastDownY = $('#canvas-card').position().top + $('#canvas-card').outerHeight(true);
        this.onResize(null);
      }

    }).on('mouseup', () => {
      this.isResizing = false;
    })
  }

  ngOnDestroy() {
    this.pullData = false;
  }

  refreshAllData() {
    this.spin = true;
    this.refreshData = true;
    this.populateData();
    this.updateFlowData();

  }

  populateData(loopNum = 0) {
    this.testExecution.get(this.params.id).subscribe(
      data => {
        console.log(data);
        let result = JSON.parse(JSON.stringify(data));

        this.processInstanceId = result['processInstanceId'];

        this.calcTime(result);

        if(result['testInstanceResults']){
          this.instanceDataSource = {};
          for(var val = 0; val < result['testInstanceResults'].length; val++){
            var elem = result['testInstanceResults'][val];
            this.calcTime(elem);
            let exists = false;
            Object.keys(this.instanceDataSource).forEach((e, val) => {
                if(e == elem.historicTestInstance._id){
                    exists = true;
                    return;
                  }
            });

            if(!exists){
              this.instanceDataSource[elem.historicTestInstance._id] = [elem];
            }
            else{
                var found = false;

                this.instanceDataSource[elem.historicTestInstance._id].forEach( (value, index) => {
                    if(this.instanceDataSource[elem.historicTestInstance._id][index]._id == elem._id){
                        this.instanceDataSource[elem.historicTestInstance._id][index] = elem;
                        found = true;
                    }
                })
                if(!found){
                    this.instanceDataSource[elem.historicTestInstance._id].push(elem);
                }
            }
            if(val == 0){
              this.selectTestInstance(elem.historicTestInstance._id);
            }
          };
        }

        if (result['testHeadResults']) {
          for (var i = 0 + this.lastVTHResultsLength; i < result['testHeadResults'].length; i++) {

            var exists = false;
            this.testHeads.forEach(elem => {
              if (elem.testHeadId == result['testHeadResults'][i].testHeadId && elem.bpmnVthTaskId == result['testHeadResults'][i].bpmnVthTaskId) {
                exists = true;
              }
            });

            if (!exists) {
              this.testHeads.push(result['testHeadResults'][i]);
              this.dataSource[result['testHeadResults'][i].testHeadId + result['testHeadResults'][i].bpmnVthTaskId] = [];
            }

            let sDate = new Date(result['testHeadResults'][i].startTime);
            let eDate = new Date(result['testHeadResults'][i].endTime);
            let tDate = (eDate.getTime() - sDate.getTime()) / 1000;

            result['testHeadResults'][i].startTime = sDate.getHours() + ":" + sDate.getMinutes() + ":" + sDate.getSeconds(); // + " " + sDate.getMonth() + "/" + sDate.getDate() + "/" + sDate.getFullYear();
            result['testHeadResults'][i].endTime = eDate.getHours() + ":" + eDate.getMinutes() + ":" + eDate.getSeconds(); // + " " + eDate.getMonth() + "/" + eDate.getDate() + "/" + eDate.getFullYear();
            result['testHeadResults'][i].totalTime = tDate + " secs";
            result['testHeadResults'][i].testHeadRequestResponse = {
                "testHeadRequest": result['testHeadResults'][i].testHeadRequest,
                "testHeadResponse": result['testHeadResults'][i].testHeadResponse,
                "statusCode": result['testHeadResults'][i].statusCode
            };
            //result['testHeadResults'][i].testHeadResponse = beautify(result['testHeadResults'][i].testHeadResponse, null, 2, 50);

            this.dataSource[result['testHeadResults'][i].testHeadId + result['testHeadResults'][i].bpmnVthTaskId].push(result['testHeadResults'][i]);

            if (i == 0) {
              this.selectTestHead(result['testHeadResults'][i].testHeadId + result['testHeadResults'][i].bpmnVthTaskId);
            }
          }
          //keep track of previous results so you don't reload them
          this.lastVTHResultsLength = result['testHeadResults'].length;

          this.testResult = Object.assign({}, result);
          // this.user.get(result['executor']).subscribe(res => {
          //   this.testResult['executor'] = res;
          // });
          //


          this.spin = false;
        }


          //only gets called once
        if (!this.refreshData && loopNum == 0 && (result['historicTestDefinition'] && result['historicTestDefinition']['bpmnInstances'][0])) {
          let id = result['historicTestDefinition']['bpmnInstances'][0]['bpmnFileId']

          if(!this.viewer){
            this.bpmnFactory.setup({
              mode: 'viewer',
              options: {
                container: '#canvas'
              },
              fileId: id
            }).then(res => {
              this.viewer = res;
              this.updateFlowData();
            });
          }else{
            this.bpmnFactory.getXml({
              fileId: id
            }).then(res => {
              this.viewer.setBpmnXml(res);
              this.updateFlowData();
            })
          }

        }
      }
    );

  }

  updateExecutionData(){
      if(this.executionJobLog){
          this.executionJobLogDataSource = {};
          for(var val = 0; val < this.executionJobLog.length; val++){
              var elem = this.executionJobLog[val];

              let exists = false;
              Object.keys(this.executionJobLogDataSource).forEach((e, val) => {
                  if(e == elem.activityId){
                      exists = true;
                      return;
                  }
              });

              if(!exists){
                  this.executionJobLogDataSource[elem.activityId] = [elem];
              }
              else{
                  var found = false;

                  this.executionJobLogDataSource[elem.activityId].forEach( (value, index) => {
                      if(this.executionJobLogDataSource[elem.activityId][index].id == elem.id){
                          this.executionJobLogDataSource[elem.activityId][index] = elem;
                          found = true;
                      }
                  })
                  if(!found){
                      this.executionJobLogDataSource[elem.activityId].push(elem);
                  }
              }
              if(val == 0){
                  this.selectExecutionJobLog(elem.activityId);
              }
          };
      }

      if(this.executionExternalTaskLog){
          this.executionExternalTaskLogDataSource = {};
          for(var val = 0; val < this.executionExternalTaskLog.length; val++){
              var elem = this.executionExternalTaskLog[val];

              let exists = false;
              Object.keys(this.executionExternalTaskLogDataSource).forEach((e, val) => {
                  if(e == elem.activityId){
                      exists = true;
                      return;
                  }
              });

              if(!exists){
                  this.executionExternalTaskLogDataSource[elem.activityId] = [elem];
              }
              else{
                  var found = false;

                  this.executionExternalTaskLogDataSource[elem.activityId].forEach( (value, index) => {
                      if(this.executionExternalTaskLogDataSource[elem.activityId][index].id == elem.id){
                          this.executionExternalTaskLogDataSource[elem.activityId][index] = elem;
                          found = true;
                      }
                  })
                  if(!found){
                      this.executionExternalTaskLogDataSource[elem.activityId].push(elem);
                  }
              }
              if(val == 0){
                  this.selectExecutionExternalTaskLog(elem.activityId);
              }
          };
      }



      if(this.executionVariables){
          this.executionVariablesDataSource = {};
          for(var val = 0; val < this.executionVariables.length; val++){
              var elem = this.executionVariables[val];

              let exists = false;
              Object.keys(this.executionVariablesDataSource).forEach((e, val) => {
                  if(e == elem.variableName){
                      exists = true;
                      return;
                  }
              });

              if(!exists){
                  this.executionVariablesDataSource[elem.variableName] = [elem];
              }
              else{
                  var found = false;

                  this.executionVariablesDataSource[elem.variableName].forEach( (value, index) => {
                      if(this.executionVariablesDataSource[elem.variableName][index].id == elem.id){
                          this.executionVariablesDataSource[elem.variableName][index] = elem;
                          found = true;
                      }
                  })
                  if(!found){
                      this.executionVariablesDataSource[elem.variableName].push(elem);
                  }
              }
              if(val == 0){
                  this.selectExecutionVariable(elem.variableName);
              }
          };
      }

  }

  calcTime(result) {
    let tsDate = new Date(result['startTime']);
    let teDate = new Date(result['endTime']);
    let ttDate = (teDate.getTime() - tsDate.getTime()) / 1000;

    result['date'] = tsDate.getMonth() + 1 + "/" + tsDate.getDate() + "/" + tsDate.getFullYear();
    result['startTime'] = tsDate.getHours() + ":" + tsDate.getMinutes() + ":" + tsDate.getSeconds();
    result['endTime'] = teDate.getHours() + ":" + teDate.getMinutes() + ":" + teDate.getSeconds();
    result['totalTime'] = ttDate + ' secs';


  }

  updateFlowData() {
    console.log(this.processInstanceId);
    this.testExecution.status(this.processInstanceId).subscribe(
      result => {
        if (result) {
          let data = result['body'];
          //check process state
          if (data.historicProcessInstance.state == 'COMPLETED') {
            this.processState = 'Completed';
            this.pullData = false;
          } else if (data.historicProcessInstance.state == 'ACTIVE') {
            this.processState = 'Running';
          } else {
            this.processState = 'Failed';
            this.pullData = false;
          }

          if(data.historicJobLog){
            this.executionJobLog =  data.historicJobLog;
          }
          if(data.historicExternalTaskLog){
            this.executionExternalTaskLog =  data.historicExternalTaskLog;
          }
          if(data.historicVariableInstance){
            this.executionVariables =  data.historicVariableInstance;
          }
          //update execution tabs -- job log, external task log, variables
          this.updateExecutionData();


            //loop through processes to get their info
          for (let i = 0; i < data.historicActivityInstance.length; i++) {
            let p = data.historicActivityInstance[i];
            let state = null;
            if (p.startTime && p.endTime && !p.canceled) { // process completed successfully
              state = 'completed';
            } else if (p.startTime && !p.endTime) { // process is still running
              state = 'running';
            } else if (p.canceled) {
              state = 'failed';
            }

            //get task id

            //highlight task boxes based on their state
            this.viewer.getModel().get('canvas').addMarker(p.activityId, 'highlight-task-' + state);
          }



          for (let i = 0; i < data.historicIncident.length; i++) {
            let p = data.historicIncident[i];
            if (p.incidentMessage) {
              this.taskLog += p.activityId + ': ' + p.incidentMessage + '\n';
            }
            this.viewer.getModel().get('canvas').addMarker(p.activityId, 'highlight-task-failed');
          }
        }
      },
      err => {

      }
    );
  }

  cancelExecution() {
    this.executionService.delete(this.testResult._id).subscribe(result => {
      this.updateFlowData();
    });
  }

  expand(element) {
    if (this.expandedElement == element)
      this.expandedElement = null;
    else
      this.expandedElement = element;
  }

  beauty(json) {
    return beautify(json, null, 2, 50);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event){
    // console.log("hi")
    if(this.viewer)
      this.viewer.resize();
  }


  json2html(json: any = [{  }], tabs = 0) {
    var html = '';
    var tabHtml = '';
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
    for (let i = 0; i < tabs; i++) {
      tabHtml += '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    for (let key in json) {
      if (json.hasOwnProperty(key)) {
        if (typeof json[key] === "object") {
          html += tabHtml + '<b><u>' + key + ':</u></b><br/>';
          if (json.constructor === Array && toInteger(key) > 0) {
            tabs--;
          }
          html += this.json2html(json[key], ++tabs);
        } else {
          html += tabHtml + '<b><u>' + key + ':</u></b>' + '<br/>';
          if (typeof json[key] === 'string') {
            json[key] = json[key].replace(/\\n/g, '<br/>' + tabHtml);
          }
          html += tabHtml + json[key] + '<br/>';
          html += '<br/>';
        }
      }
    }
    return html;
  }

  selectTestHead(key) {
    this.selectedTestHead = key;
  }

  selectTestInstance(key){
    this.selectedTestInstance = key;

  }

    selectExecutionJobLog(key){
        this.selectedExecutionJobLog = key;

    }

    selectExecutionExternalTaskLog(key){
        this.selectedExecutionExternalTaskLog = key;

    }

    selectExecutionVariable(key){
        this.selectedExecutionVariable = key;

    }

  call() {
    //
  }

}

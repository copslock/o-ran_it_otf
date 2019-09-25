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


import { Component, OnInit, Input, ViewChild, HostListener, AfterContentInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { TestInstanceService } from 'app/shared/services/test-instance.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSnackBar } from '@angular/material';
import Modeler from 'bpmn-js';
import { timeInterval } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { AlertModalComponent } from 'app/shared/modules/alert-modal/alert-modal.component';
import { AlertSnackbarComponent } from 'app/shared/modules/alert-snackbar/alert-snackbar.component';
import { SchedulingService } from 'app/shared/services/scheduling.service';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { Buffer } from 'buffer';
import { ViewWorkflowModalComponent } from 'app/shared/modules/view-workflow-modal/view-workflow-modal.component';
import { ExecuteService } from 'app/shared/services/execute.service';
import { BpmnFactoryService } from 'app/shared/factories/bpmn-factory.service';

@Component({
  selector: 'app-test-definition-expanded-details',
  templateUrl: './test-definition-expanded-details.component.pug',
  styleUrls: ['./test-definition-expanded-details.component.scss']
})
export class TestDefinitionExpandedDetailsComponent implements OnInit, OnDestroy {

  @Input() public testDefinitionId;

  @Input() public events: Observable<void>;
  
  @ViewChild(MatPaginator) instancePaginator: MatPaginator;
  @ViewChild('canvas') canvas: ElementRef;

  public data = null;
  public dataLength = 0;
  public displayedColumns;
  public foundStatuses = ['name'];
  public statusList = ['COMPLETED', 'SUCCESS', 'UNKNOWN', 'FAILURE', 'STOPPED', 'UNAUTHORIZED', 'FAILED'];
  public testInstanceList = null;
  public testExecutionList = [];
  public viewer;
  public eventSub;
  public bpmnXml;

  constructor(
    private bpmnFactory: BpmnFactoryService, 
    private fileTransfer: FileTransferService, 
    private dialog: MatDialog, 
    private testDefinition: TestDefinitionService, 
    private testInstance: TestInstanceService, 
    private testExecution: TestExecutionService, 
    private execute: ExecuteService, 
    private modal: MatDialog, 
    private snack: MatSnackBar
  ) { }

  async ngOnInit() {
    
    await this.testDefinition.get(this.testDefinitionId).subscribe(
      result => {
        result['createdAt'] = new Date(result['createdAt']).toLocaleString();
        result['updatedAt'] = new Date(result['updatedAt']).toLocaleString();
        this.data = result;
        if(this.data.bpmnInstances){
          this.bpmnFactory.setup({
            mode: 'viewer',
            options: {
              container: this.canvas.nativeElement
            },
            fileId: this.data.bpmnInstances[0].bpmnFileId
          }).then(res => {
            this.viewer = res;
          });
          // this.loadDiagram();
        }
      }
    );

    this.testInstanceList = new MatTableDataSource();
    this.testInstance.find({
      $limit: -1,
      $sort: {
        createdAt: -1
      },
      testDefinitionId: this.testDefinitionId
    }).subscribe(
      result => {
        this.testInstanceList.data = result;
        this.testInstanceList.paginator = this.instancePaginator;

        this.testInstanceList.data.forEach(elem => {
          this.setExecutions(elem._id);
        });

        this.displayedColumns = ['name', 'COMPLETED', 'SUCCESS', 'UNKNOWN', 'FAILURE', 'STOPPED', 'UNAUTHORIZED', 'FAILED', 'options'];

      }
    )

    //If parent emeits, diagram will reload
    if(this.events != undefined && this.events){
      this.events.subscribe(() => {
        setTimeout(() => {
          this.loadDiagram();
        }, 500)
      });
    }
  }

  enlargeBpmn(){
    this.dialog.open(ViewWorkflowModalComponent, {
      data: {
        xml: this.viewer.getBpmnXml()
      },
      width: '100%',
      height: '100%'
    })
  }

  ngOnDestroy() {
    delete this.events;
  }

  async setExecutions(instanceId) {
    // ['$limit=-1', '$sort[startTime]=-1', 'testInstanceId=' + instanceId]
    this.testExecution.find({
      $limit: -1,
      $sort: {
        startTime: -1
      },
      'historicTestInstance._id': instanceId
    }).subscribe(
      result => {
        for(let i = 0; i < result['length']; i++){
          result[i].startTime = new Date(result[i].startTime).toLocaleString();
          this.testExecutionList.push(result[i]);
          for(let j = 0; j < this.testInstanceList.data.length; j++){
            if(this.testInstanceList.data[j]._id == instanceId){
              if(!this.testInstanceList.data[j][result[i]['testResult']]){
                this.testInstanceList.data[j][result[i]['testResult']] = 1;
              }else{
                this.testInstanceList.data[j][result[i]['testResult']] += 1;
              }
            }
          }
        }

        //this.setDisplayColumns();
        // for(let i = 0; i < result[i]; i++){
        //   this.testInstanceList[instanceId] = result;
        // }
        
      }
    );
  }

  loadDiagram(){
    if(this.viewer && this.data && this.data.bpmnInstances){
      this.viewer.renderDiagram();
    }
  }

  executeTestInstance(element){
    (element);
    if(element.testDefinitionId){
      const executer = this.modal.open(AlertModalComponent, {
        width: '250px',
        data: {
          type: 'confirmation',
          message: 'Are you sure you want to run ' + element.testInstanceName + '?'
        }
      });

      executer.afterClosed().subscribe(result => {
        if(result){
          this.execute.create({
            _id : element._id,
            async: true
          }).subscribe((result) => {
            this.snack.openFromComponent(AlertSnackbarComponent, {
              duration: 1500,
              data: {
                message: 'Test Instance Executed'
              }
            });
          },
          (error) => {
            this.modal.open(AlertModalComponent, {
              width: '450px',
              data: {
                type: 'Alert',
                message: 'Failed to execute Test Instance!\n' + JSON.stringify(error)
              }
            });
          })
        }
      });
    }
    
  }

}

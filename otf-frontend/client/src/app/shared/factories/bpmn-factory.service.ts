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


import { Injectable } from '@angular/core';
import { FileTransferService } from '../services/file-transfer.service';
import { TestDefinitionService } from '../services/test-definition.service';
import { Observable } from 'rxjs';
import { Buffer } from 'buffer';
import { BpmnOptions, Bpmn } from '../models/bpmn.model';

interface BpmnFactoryOptions extends BpmnOptions {
  fileId?: String,
  testDefinitionId?: String,
  version?: String,
  xml?: String
}

@Injectable({
  providedIn: 'root'
})
export class BpmnFactoryService {

  constructor(
    private filesTransfer: FileTransferService,
    private testDefinition: TestDefinitionService
  ) { }

  public async setup(options: BpmnFactoryOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      //check for required options
      if (!options.mode) {
        console.error('Bpmn options require: mode');
        reject('Bpmn options require: mode')
      }

      let xml = await this.getXml(options);

      let instance = new Bpmn(xml, {
        mode: options.mode,
        options: options.options
      })

      resolve(instance);
    });

  }

  public async getXml(options): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let xml;

      //handle the way to retrieve bpmn xml
      if (options.xml) {
        xml = options.xml
      } else if (options.fileId) {
        xml = await this.loadFile(options.fileId);
      } else if (options.testDefinitionId && options.version) {
        let fileId = await this.getFileId(options.testDefinitionId, options.version);
        xml = await this.loadFile(fileId);
      } else if (options.testDefinitionId) {
        let fileId = await this.getFileId(options.testDefinitionId);
        xml = await this.loadFile(fileId);
      } else {
        console.warn('Either xml, fileId, testDefinitionId and version, or testDefinitionId is required to render the bpmn');
      }

      resolve(xml);

    });

  }

  private getFileId(id, version?): Observable<Object> {
    return new Observable(observer => {
      this.testDefinition.get(id).subscribe(
        data => {
          if (data['bpmnInstances']) {
            if (version) {
              let index;
              for (let i = 0; i < data['bpmnInstances'].length; i++) {
                if (version == data['bpmnInstances'][i].version) {
                  index = i;
                  break;
                }
              }
              if (index) {
                observer.next(data['bpmnInstances'][index].bpmnFileId);
              } else {
                observer.error('No bpmn file');
              }

            } else {
              if (data['bpmnInstances'][data['bpmnInstances'].length - 1].bpmnFileId) {
                observer.next(data['bpmnInstances'][data['bpmnInstances'].length - 1].bpmnFileId);
              } else {
                observer.error('No bpmn file');
              }
            }
          } else {
            observer.error('No bpmn instances');
          }
        },
        err => {
          observer.error('No test definition found');
        }
      )
    })
  }

  public loadFile(bpmnFileId) {
    return new Promise((resolve, reject) => {
      this.filesTransfer.get(bpmnFileId).subscribe(content => {
        resolve(new Buffer(content as Buffer).toString());
      }, err => {
        reject(err);
      });
    });
  }
}

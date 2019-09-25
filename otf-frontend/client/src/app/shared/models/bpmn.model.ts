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


import Modeler from 'bpmn-js/lib/Modeler';
import Viewer from 'bpmn-js/lib/NavigatedViewer';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { Observable } from 'rxjs';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';

import { saveAs } from 'file-saver';
//import { parseString } from 'xml2js';
import { HostListener } from '@angular/core';

export interface BpmnOptions {
    mode: 'viewer' | 'modeler',
    options: {
        container: any
    }
}

export class Bpmn {

    protected model: any;
    protected bpmnXml: String;
    private options: BpmnOptions;

    constructor(bpmnXml: String, options: BpmnOptions) {
        //check for required options
        if (!options.mode) {
            console.error('Bpmn options require: mode');
        }

        this.bpmnXml = bpmnXml;
        this.options = options;

        //setup model
        this.setModel();

        //render diagram
        this.renderDiagram();
    }

    // Getters

    public getModel() {
        return this.model;
    }

    public async getBpmnXml() {
        return new Promise((resolve, reject) => {
            this.model.saveXML({ format: true }, function (err, xml) {
                if(err){
                    reject(err);
                }
                resolve(xml);
            })
        });
    }

    // Setters

    private setModel(options?) {

        if (this.model) {
            return -1;
        }

        let op = this.options.options;

        if (options) {
            op = options;
        }

        if (!op) {
            console.error('Options for the viewer/modeler must be provided');
            return -1;
        }

        //handle the mode (viewer or modeler)
        switch (this.options.mode.toLowerCase()) {
            case 'viewer':
                this.model = new Viewer(op);
                break;

            case 'modeler':
                this.model = new Modeler(op);
                break;

            default:
                console.error('Mode must either be "viewer" or "modeler"');
                return;
        }

    }

    public async setBpmnXml(xml) {
        this.bpmnXml = xml;
        await this.renderDiagram();
    }

    // Methods

    public async renderDiagram() {
        return new Promise((resolve, reject) => {
            if (this.bpmnXml) {
                this.model.importXML(this.bpmnXml, (err) => {
                    if (!err) {
                        this.model.get('canvas').zoom('fit-viewport');
                        resolve(true)
                    } else {
                        console.error(err);
                        resolve(false);
                    }
                });
            }
        })
    }

    public resize() {
        this.model.get('canvas').zoom('fit-viewport');
    }

    public download(saveName?) {

        this.model.saveXML({ format: true }, function (err, xml) {
            if (!saveName) {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(xml.toString(), "text/xml");

                let id = xmlDoc.getElementsByTagName("bpmn:process")[0].attributes.getNamedItem("id").value;
                
                if (id) {
                    saveName = id;
                } else {
                    saveName = 'workflow';
                }
            }

            saveName += ".bpmn";

            let blob = new Blob([xml], { type: "application/xml" });
            saveAs(blob, saveName);
        })
    }

}
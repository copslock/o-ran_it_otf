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


import { Component, OnInit, Input, Output, EventEmitter, ViewChild, NgModuleRef, Injector, Compiler, NgModule, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AlertSnackbarComponent } from '../alert-snackbar/alert-snackbar.component';


@Component({
  selector: 'app-form-generator',
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss']
})
export class FormGeneratorComponent implements OnInit {

  public test = {
    text1: "Hello please enter text1",
    text2: "Hello please enter text2",
    one: {
      text1: "lol"
    },
    siteSpecific: {
      port: "1234",
      host: "google.com"
    },
    list: ["Enter", "some", "values"],
    list2: [{"test": "hello"}, {"test2": "hello2"}]
  }
  public isSaved = false;
  public arrayCheck;
  @Input() public JSONData : any;
  @Input() public taskId: any;
  @ViewChild('test', { read: ViewContainerRef }) public containerDiv;
  @Output() public childEvent = new EventEmitter();

  form = new FormGroup({
  });

  //public textAreaTemplate = "<textarea [(value)]='";
  /*
  constructor(private _compiler: Compiler,
            private _injector: Injector,
            private _m: NgModuleRef<any>) {
}

ngAfterViewInit() {
  const template = '<span>generated on the fly: {{name}}</span>';

  const tmpCmp = Component({template: template})(class {
  });
  const tmpModule = NgModule({declarations: [tmpCmp]})(class {
  });

  this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
    .then((factories) => {
      const f = factories.componentFactories[0];
      const cmpRef = this.vc.createComponent(f);
      cmpRef.instance.name = 'dynamic';
    })
}
  */
 
  //public containerDiv;// = document.getElementById(tas);
  constructor(private compiler: Compiler,
    private injector: Injector,
    private snack: MatSnackBar,
    private m: NgModuleRef<any>) { }
    public testing = "hello";
    //public textAreaTemplate = '';
  ngOnInit() {
   
   //this.JSONData = this.test;
    if(this.JSONData){
      this.arrayCheck = JSON.parse(JSON.stringify(this.JSONData));
      let arr = [];
      this.populatePage(arr, 1);
      this.onFormChange();
    }
  }

  onFormChange(){
    
    this.form.valueChanges.subscribe(val => {
      this.copyValues([]);
      
      let event = {
        object: this.JSONData,
        taskId: this.taskId
      };
      this.childEvent.emit(event);
    });
  }
  //checks if data was supplied to form
  noData(){
   
    if(Object.keys(this.form.controls).length == 0){
      return true;
    }else{
      return false;
    }
  }

  copyValues(keyArr){
    // console.log("Fixed");
    let data = this.JSONData;
    let tempArrCheck = this.arrayCheck;
    let keyPath = "";
    for(let k in keyArr){
      tempArrCheck = tempArrCheck[keyArr[k]];
      data = data[keyArr[k]];
      keyPath += keyArr[k];
    }
    
    for(let key in data){
      if(this.form.get(keyPath + key)){
        if(tempArrCheck[key] === "_ConvertThisArray_"){
          let temp = this.form.get(keyPath + key).value;
          data[key] = temp.split(',');
        }else{
          data[key] = this.form.get(keyPath + key).value;
        }
      }else{
        keyArr.push(key);
        this.copyValues(keyArr);
        keyArr.splice(keyArr.length - 1);
      }
    }
    // Object.keys(this.form.controls).forEach(key => {
    //   data[key] = this.form.get(key).value;
    // });
    
  }

  populatePage(keyArr, level){//vthinput and testInput
    let data = this.JSONData;
    //used to detect and convert arrays after input is entered
    let tempArrCheck = this.arrayCheck;
    let keyPath = "";
    for(let k in keyArr){
      tempArrCheck = tempArrCheck[keyArr[k]];
      data = data[keyArr[k]];
      keyPath += keyArr[k];
    }
    //console.log(data);
    
    for( let key in data){
      let indent = 'ml-' + level;
      
      if((typeof data[key] === "object" && !data[key].length) || (typeof data[key] === "object" && data[key].length && 
        typeof data[key][0] === "object")){
        
        let str = '';
        if(level >= 4){
          str = 'h5';
          //indent = 'ml-5';
        }else if(level === 3){
          str = 'h4';
          //indent = 'ml-4';
        }else if (level === 2){
          str = 'h3';
          //indent = 'ml-3';
        }else{
          str = 'h2'
          //indent = 'ml-2';
        }
        if(data.constructor === Array){
          
          keyArr.push(key);
          this.populatePage(keyArr, level);
          keyArr.splice(keyArr.length - 1);
          continue;
        }
        const textHeaderTemplate = '<' + str + ' class="'+ indent +'" style="font-weight:bold">' + key.trim() + '</'+ str + '>';
        const tmpCmp = Component({template: textHeaderTemplate})(class {
        });
        const tmpModule = NgModule({imports:[ReactiveFormsModule] ,declarations: [tmpCmp]})(class {
        });
             
        this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
            const f = factories.componentFactories[0];
            const cmpRef = this.containerDiv.createComponent(f);
          })
        
        keyArr.push(key);
        level ++;
        this.populatePage(keyArr, level);
        level = level -1;
        keyArr.splice(keyArr.length - 1);
      }
      else if(typeof data[key] === "string"){
       // this.containerDiv.
     
       this.form.addControl(keyPath + key.trim(), new FormControl(data[key]));
      
        if(level > 1){
          
          const textInputTemplate = '<div class="  mb-1 '+ indent + '" [formGroup]="form"> <label class="mr-2">' + key.trim() + '</label><input formControlName="' + keyPath + key.trim() + '"> </div>';
          const tmpCmp = Component({template: textInputTemplate})(class {
          });
         const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
          });
          
          //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
          
          this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = this.containerDiv.createComponent(f);
              cmpRef.instance.form = this.form;
            })
        }
        else{
          const textInputTemplate = '<div class="  mb-1 '+ indent + '" [formGroup]="form"> <h5 style="font-weight:bold" class="mr-2">' + key.trim() + '</h5><input formControlName="' + keyPath + key.trim() + '"> </div>';
          const tmpCmp = Component({template: textInputTemplate})(class {
          });
         const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
          });
          
          //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
          
          this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = this.containerDiv.createComponent(f);
              cmpRef.instance.form = this.form;
            })
        }
       
        
      }
      else if(typeof data[key] === "object" && data[key].length){
        
        //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
        let temp = "";
        for(let i = 0; i < data[key].length; i++){
          if(i != data[key].length - 1)
            temp += data[key][i] + ",";
          else
            temp += data[key][i] + "";
        }
        //this.containerDiv.element.nativeElement.appendChild(document.createElement("textarea")).innerHTML = temp.trim();
        this.form.addControl(keyPath + key.trim(), new FormControl(temp));
        
        tempArrCheck[key] = "_ConvertThisArray_";

        if(level > 1){
         
          const textAreaTemplate = '<div class= "  mb-1 '+ indent + '" [formGroup]="form"> <label class="mr-2">' + key.trim() + '</label><textarea rows="' + data[key].length + '" formControlName="' + keyPath + key.trim() + '">  </textarea></div>';// + path + "'> "+ data[key] + "</textarea>"
          const tmpCmp = Component({template: textAreaTemplate})(class {
          });
         const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
          });
          
          //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
          
          this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = this.containerDiv.createComponent(f);
              cmpRef.instance.form = this.form;
            })
        }
        else{
          const textAreaTemplate = '<div class= "  mb-1 '+ indent + '" [formGroup]="form"> <h5 style="font-weight:bold" class="mr-2">' + key.trim() + '</h5><textarea rows="' + data[key].length + '" formControlName="' + keyPath + key.trim() + '">  </textarea></div>';// + path + "'> "+ data[key] + "</textarea>"
          const tmpCmp = Component({template: textAreaTemplate})(class {
          });
         const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
          });
          
          //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
          
          this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = this.containerDiv.createComponent(f);
              cmpRef.instance.form = this.form;
            })
        }
        // const textAreaTemplate = '<div class= "mb-2" [formGroup]="form"> <label class="mr-2">' + key.trim() + '</label><textarea rows="' + data[key].length + '" formControlName="' + keyPath + key.trim() + '">  </textarea></div>';// + path + "'> "+ data[key] + "</textarea>"
        // const tmpCmp = Component({template: textAreaTemplate})(class {
        // });
        // const tmpModule = NgModule({imports:[ReactiveFormsModule] ,declarations: [tmpCmp]})(class {
        // });
        
        // //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
        
        // this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
        //   .then((factories) => {
        //     const f = factories.componentFactories[0];
        //     const cmpRef = this.containerDiv.createComponent(f);
        //     cmpRef.instance.form = this.form;
        //   })
        
      }
      else if(typeof data[key] === 'boolean'){
        let str = '';
        let str2 = 'h5';
        let bold = ' style="font-weight:bold"'
        if(level > 1){
          str2 = 'label';
          bold = '';
        }
        if(data[key]){
          str = '<option [ngValue]="true">true</option><option [ngValue]="false">false</option>';
        }else{
          str = '<option [ngValue]="false">false</option><option [ngValue]="true">true</option>';
        }
        this.form.addControl(keyPath + key.trim(), new FormControl(data[key]));
        const textAreaTemplate = '<div class= "  mb-1 '+ indent + '" [formGroup]="form"> <' + str2 + bold + ' class="mr-2">' + key.trim() + '</' + str2 + '><select formControlName="' + keyPath + key.trim() +  '">' + str + ' </select></div>';// + path + "'> "+ data[key] + "</textarea>"
          const tmpCmp = Component({template: textAreaTemplate})(class {
        });
        const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
        });
        
        //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
        
        this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
            const f = factories.componentFactories[0];
            const cmpRef = this.containerDiv.createComponent(f);
            cmpRef.instance.form = this.form;
          })
      }
      else if(typeof data[key] === typeof 23){
        let str = 'h5';
        let bold = ' style="font-weight:bold"';
        if(level > 1){
          str = 'label';
          bold = '';
        }
        this.form.addControl(keyPath + key.trim(), new FormControl(data[key]));
        const textInputTemplate = '<div class="  mb-1 '+ indent + '" [formGroup]="form"> <' + str + bold + ' class="mr-2">' + key.trim() + '</' + str + '><input type="number" formControlName="' + keyPath + key.trim() + '"> </div>';
          const tmpCmp = Component({template: textInputTemplate})(class {
        });
        const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
        });
        
        //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
        
        this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
            const f = factories.componentFactories[0];
            const cmpRef = this.containerDiv.createComponent(f);
            cmpRef.instance.form = this.form;
          })
      }
      else{
        const textAreaTemplate = ' <h5 style="font-weight:bold" class="mr-2 '+ indent + '">' + key.trim() + ': Type Not Supported</h5>';// + path + "'> "+ data[key] + "</textarea>"
          const tmpCmp = Component({template: textAreaTemplate})(class {
          });
         const tmpModule = NgModule({imports:[ReactiveFormsModule], declarations: [tmpCmp]})(class {
          });
          
          //this.containerDiv.element.nativeElement.appendChild(document.createElement("label")).innerHTML = key.trim();
          
          this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = this.containerDiv.createComponent(f);
              cmpRef.instance.form = this.form;
            })
      }

    }
  }
}

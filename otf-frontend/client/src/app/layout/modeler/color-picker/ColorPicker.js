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


import {
    is
  } from 'bpmn-js/lib/util/ModelUtil';
  
  
  /**
   * A basic color picker implementation.
   *
   * @param {EventBus} eventBus
   * @param {ContextPad} contextPad
   * @param {CommandStack} commandStack
   */
  export default function ColorPicker(eventBus, contextPad, commandStack) {
  
    contextPad.registerProvider(this);
  
    commandStack.registerHandler('shape.updateColor', UpdateColorHandler);
  
    function changeColor(event, element) {
  
      var color = window.prompt('type a color code');
  
      commandStack.execute('shape.updateColor', { element: element, color: color });
    }
  
  
    this.getContextPadEntries = function(element) {
  
      if (is(element, 'bpmn:Event')) {
        return {
          'changeColor': {
            group: 'edit',
            className: 'icon-red',
            title: 'Change element color',
            action: {
              click: changeColor
            }
          }
        };
      }
    };
  }
  
  
  
  /**
   * A handler updating an elements color.
   */
  function UpdateColorHandler() {
  
    this.execute = function(context) {
      context.oldColor = context.element.color;
      context.element.color = context.color;
  
      return context.element;
    };
  
    this.revert = function(context) {
      context.element.color = context.oldColor;
  
      return context.element;
    };
  
  }
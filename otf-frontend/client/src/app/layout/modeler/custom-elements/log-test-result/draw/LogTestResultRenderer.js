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


import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Cat from '../image';

import {
  append as svgAppend,
  create as svgCreate
} from 'tiny-svg';


export default function NyanRender(eventBus) {
  BaseRenderer.call(this, eventBus, 1500);

  this.canRender = function(element) {
    return is(element, 'custom:Log');
  };


  this.drawShape = function(parent, shape) {
    var url = Cat.dataURL;

    var catGfx = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href: url
    });

    svgAppend(parent, catGfx);

    return catGfx;
  };
}

inherits(NyanRender, BaseRenderer);

NyanRender.$inject = [ 'eventBus' ];
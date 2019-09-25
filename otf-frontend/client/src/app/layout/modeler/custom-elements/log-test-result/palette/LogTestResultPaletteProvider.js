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


import Cat from '../image';


/**
 * A provider for quick service task production
 */
export default function LogTestResultPaletteProvider(palette, create, elementFactory) {

  this._create = create;
  this._elementFactory = elementFactory;

  palette.registerProvider(this);
}

LogTestResultPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory'
];

LogTestResultPaletteProvider.prototype.getPaletteEntries = function() {

  var elementFactory = this._elementFactory,
      create = this._create;

  function startCreate(event) {
    var serviceTaskShape = elementFactory.create(
      'shape', { type: 'custom:Log' }
    );

    create.start(event, serviceTaskShape);
  }

  return {
    'create-task': {
      group: 'activity',
      title: 'Create a new nyan CAT!',
      imageUrl: Cat.dataURL,
      action: {
        dragstart: startCreate,
        click: startCreate
      }
    }
  };
};
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


const events = require('events');
const eventEmitter = new events.EventEmitter();

module.exports.emitter = eventEmitter;

// @author: rp978t
/* @description: This module serves as a common emitter to be used by
 * the test execution controller and job definitions. The Agenda library
 * only returns a job object when that object persists in the database.
 * Therefore, there is no conventional way to return the response from
 * the service api (inside the job definition) to the controller to be
 * sent back to the user of the scheduling endpoint (In this case it would
 * be the UI). Setting up a listener in the controller will allow emitting
 * an event from the job definition to relay the response. Events are
 * distinguished by using the job identifier as part of the event name.
 */

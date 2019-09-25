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


import { TestDefinition } from "./test-definition.model";
import { TestInstance } from "./test-instance.model";

export interface TestExecution {

    _id: String;
    processInstanceId: String;
    businessKey: String;
    testResult: String;
    testDetails: Object;
    startTime: Date;
    endTime: Date;
    async: Boolean;
    asyncTopic: String;
    groupId: String;
    executorId: String;
    testHeadResults: Array<Object>;
    testInstanceResults: Array<Object>;
    historicEmail: String;
    historicTestInstance: TestInstance;
    historicTestDefinition: TestDefinition;

}
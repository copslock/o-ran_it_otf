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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeathersService } from 'app/shared/services/feathers.service';
import { ModelService } from 'app/shared/services/model.service';
import { TestDefinitionService } from 'app/shared/services/test-definition.service';
import { TestHeadService } from 'app/shared/services/test-head.service';
import { TestInstanceService } from 'app/shared/services/test-instance.service';
import { TestExecutionService } from 'app/shared/services/test-execution.service';
import { AccountService } from 'app/shared/services/account.service';
import { AuthService } from 'app/shared/services/auth.service';
import { ExecuteService } from 'app/shared/services/execute.service';
import { FeedbackService } from 'app/shared/services/feedback.service';
import { FileTransferService } from 'app/shared/services/file-transfer.service';
import { FileService } from 'app/shared/services/file.service';
import { GroupService } from 'app/shared/services/group.service';
import { SchedulingService } from 'app/shared/services/scheduling.service';
import { UserService } from 'app/shared/services/user.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    TestDefinitionService,
    TestHeadService,
    TestInstanceService,
    TestExecutionService,
    AccountService,
    AuthService,
    ExecuteService,
    FeedbackService,
    FileTransferService,
    FileService,
    GroupService,
    SchedulingService,
    UserService
  ],
  declarations: []
})
export class CoreModule { }

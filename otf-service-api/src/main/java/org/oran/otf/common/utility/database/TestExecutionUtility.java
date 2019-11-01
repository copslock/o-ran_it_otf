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


package org.oran.otf.common.utility.database;

import org.oran.otf.common.model.TestExecution;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class TestExecutionUtility {

  public static void saveTestResult(
      MongoTemplate mongoOperation, TestExecution execution, String testResult) {
    Query query = new Query();
    query.addCriteria(Criteria.where("groupId").is(execution.getGroupId()));
    query.addCriteria(Criteria.where("businessKey").is(execution.getBusinessKey()));
    Update update = new Update();
    update.set("testResult", testResult);
    UpdateResult result = mongoOperation.updateFirst(query, update, TestExecution.class);
  }
}

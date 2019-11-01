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


package org.oran.otf.api.service.impl;

import org.oran.otf.api.Utilities;
import org.oran.otf.api.service.VirtualTestHeadService;
import org.oran.otf.common.model.Group;
import org.oran.otf.common.model.TestHead;
import org.oran.otf.common.model.User;
import org.oran.otf.common.repository.GroupRepository;
import org.oran.otf.common.repository.TestHeadRepository;
import org.oran.otf.common.repository.UserRepository;
import org.oran.otf.common.utility.Utility;
import org.oran.otf.common.utility.database.Generic;
import org.oran.otf.common.utility.http.ResponseUtility;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.UserPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.Response;
import java.util.Date;
import java.util.Optional;

@Service
public class VirtualTestHeadServiceImpl implements VirtualTestHeadService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    TestHeadRepository testHeadRepository;

    @Autowired
    MongoTemplate mongoTemplate;

    private static final String logPrefix = Utility.getLoggerPrefix();

    @Override
    public Response updateVirtualTestHead(String authorization, String testHeadName, TestHead newTestHead) {
        if (authorization == null) {
            return Utilities.Http.BuildResponse.unauthorizedWithMessage("Missing authorization header.");
        }

        // try to find the test head
        Optional<TestHead> optionalTestHead =
                testHeadRepository.findByTestHeadName(testHeadName);
        TestHead testHead = Utilities.resolveOptional(optionalTestHead);
        if (testHead == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format("A test head with identifier %s was not found.", testHeadName));
        }

        // try to find the group of the test head
        String testHeadGroupId = testHead.getGroupId().toString();
        Group testHeadGroup = Generic.findByIdGeneric(groupRepository, testHead.getGroupId());
        if (testHeadGroup == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    String.format(
                            "The group (id: %s) associated with the test head does not exist.",
                            testHeadGroupId));
        }

        // try to find the user for the mechanizedId used to make this request
        User user = Utilities.findUserByAuthHeader(authorization, userRepository);
        if (user == null) {
            return Utilities.Http.BuildResponse.badRequestWithMessage(
                    "No user associated with mechanized identifier used for this request.");
        }

        if (!PermissionChecker.hasPermissionTo(user, testHeadGroup, UserPermission.Permission.WRITE, groupRepository)) {
            String error =
                    String.format(
                            "Unauthorized the write to test head with name, %s.",
                            testHeadGroupId);
            return ResponseUtility.Build.unauthorizedWithMessage(error);
        }

        return updateTestHeadFields(testHead, newTestHead, user);
    }

    private Response updateTestHeadFields(TestHead testHead, TestHead newTestHead, User user) {
        Query select = Query.query(Criteria.where("_id").is(testHead.get_id())).addCriteria(Criteria.where("groupId").is(testHead.getGroupId()));
        Update update = new Update();

        if (newTestHead.getTestHeadName() != null) {
            if (doesTestHeadWithNameExist(newTestHead.getTestHeadName())) {
                String error =
                        String.format(
                                "Cant change testHeadName to %s since it already exists.",
                                newTestHead.getTestHeadName());
                return ResponseUtility.Build.badRequestWithMessage(error);
            }
            testHead.setTestHeadName(newTestHead.getTestHeadName());
            update.set("testHeadName", newTestHead.getTestHeadName());
        }
        if (newTestHead.getTestHeadDescription() != null) {
            testHead.setTestHeadDescription(newTestHead.getTestHeadDescription());
            update.set("testHeadDescription", newTestHead.getTestHeadDescription());
        }
        if (newTestHead.getHostname() != null) {
            testHead.setHostname(newTestHead.getHostname());
            update.set("hostname", newTestHead.getHostname());
        }
        if (newTestHead.getPort() != null) {
            testHead.setPort(newTestHead.getPort());
            update.set("port", newTestHead.getPort());
        }
        if (newTestHead.getResourcePath() != null) {
            testHead.setResourcePath(newTestHead.getResourcePath());
            update.set("resourcePath", newTestHead.getResourcePath());
        }
        if (newTestHead.getAuthorizationType() != null) {
            testHead.setAuthorizationType(newTestHead.getAuthorizationType());
            update.set("authorizationType", newTestHead.getAuthorizationType());
        }
        if (newTestHead.getAuthorizationCredential() != null) {
            testHead.setAuthorizationCredential(newTestHead.getAuthorizationCredential());
            update.set("authorizationCredential", newTestHead.getAuthorizationCredential());
        }
        if (newTestHead.getAuthorizationEnabled() != null) {
            testHead.setAuthorizationEnabled(newTestHead.getAuthorizationEnabled());
            update.set("authorizationEnabled", newTestHead.getAuthorizationEnabled());
        }
        if (newTestHead.getVthInputTemplate() != null) {
            testHead.setVthInputTemplate(newTestHead.getVthInputTemplate());
            update.set("vthInputTemplate", newTestHead.getVthInputTemplate());
        }
        testHead.setUpdatedAt(new Date());
        update.set("updatedAt", testHead.getUpdatedAt());
        testHead.setUpdatedBy(user.get_id());
        update.set("updatedBy", user.get_id());

        mongoTemplate.updateFirst(select, update, "testHeads");
        return ResponseUtility.Build.okRequestWithObject(testHead);
    }

    // check if test head exists in database by name
    private boolean doesTestHeadWithNameExist(String name) {
        Optional<TestHead> optionalTestHead =
                testHeadRepository.findByTestHeadName(name);
        return optionalTestHead.isPresent();
    }
}

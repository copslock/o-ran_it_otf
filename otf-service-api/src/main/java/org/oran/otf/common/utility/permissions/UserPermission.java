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


package org.oran.otf.common.utility.permissions;

import org.oran.otf.common.model.User;

import java.util.Map;
import java.util.Set;

public class UserPermission {
    private User user;
    private Map<String,Set<String>> userAccessMap;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Map<String, Set<String>> getUserAccessMap() {
        return userAccessMap;
    }

    public void setUserAccessMap(Map<String,Set<String>> userAccessMap) {
        this.userAccessMap = userAccessMap;
    }

    public boolean  hasAccessTo(String groupId,String permission) {
        if (userAccessMap.get(groupId) == null) {
            return false;
        }
        Set<String> group = userAccessMap.get(groupId);
        return group.stream().anyMatch(groupPermission->groupPermission.equalsIgnoreCase(permission));
    }
    public class Permission{
        public static final String READ = "READ";
        public static final String WRITE = "WRITE";
        public static final String EXECUTE = "EXECUTE";
        public static final String DELETE = "DELETE";
        public static final String MANAGEMENT ="MANAGEMENT";
    }
}

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

import org.oran.otf.common.model.Group;
import org.oran.otf.common.model.User;
import org.oran.otf.common.repository.GroupRepository;

import java.util.Collection;

public class PermissionChecker {
    //check is a user have a certain permission in a group
    public static boolean hasPermissionTo(User user,Group group,String permission, GroupRepository groupRepository){
        UserPermission userPermission = new PermissionUtil().buildUserPermission(user,groupRepository);
        return hasPermissionTo(userPermission,group,permission);
    }
    public static boolean hasPermissionTo(User user, Group group, Collection<String> permissions, GroupRepository groupRepository){
        UserPermission userPermission = new PermissionUtil().buildUserPermission(user,groupRepository);
        for(String permission : permissions){
            if(!hasPermissionTo(userPermission,group,permission)){
                return false;
            }
        }
        return true;
    }
    // check a users list of permission in a group
    private static boolean hasPermissionTo(UserPermission userPermission, Group group,String permission){
        switch (permission.toUpperCase()) {
            case (UserPermission.Permission.READ):
                return userPermission.hasAccessTo(group.get_id().toString(),UserPermission.Permission.READ);
            case (UserPermission.Permission.WRITE):
                return userPermission.hasAccessTo(group.get_id().toString(),UserPermission.Permission.WRITE);
            case (UserPermission.Permission.EXECUTE):
                return userPermission.hasAccessTo(group.get_id().toString(),UserPermission.Permission.EXECUTE);
            case (UserPermission.Permission.DELETE):
                return userPermission.hasAccessTo(group.get_id().toString(),UserPermission.Permission.DELETE);
            case (UserPermission.Permission.MANAGEMENT):
                return userPermission.hasAccessTo(group.get_id().toString(),UserPermission.Permission.MANAGEMENT);
            default:
                return false;// reaches here when permission provided is not an option
        }
    }
}
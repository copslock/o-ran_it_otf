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
import org.oran.otf.common.model.GroupMember;
import org.oran.otf.common.model.Role;
import org.oran.otf.common.model.User;
import org.oran.otf.common.repository.GroupRepository;

import java.util.*;

public class PermissionUtil {
    //build userPermission object which contains all access control information of the user
    public UserPermission buildUserPermission(User user, GroupRepository groupRepository) {
        UserPermission userPermission = new UserPermission();
        userPermission.setUser(user);
        Map<String,Set<String>> userAccessMap; // map from group to permission that user have in that group

        userAccessMap = mapGroupsToPermission(user,groupRepository);
        userPermission.setUserAccessMap(userAccessMap);
        return userPermission;
    }
    // return if user have specified permission in a certain group
    // ***********only use this on groups that the user is in directly (non-child and non parents)****************
    public static boolean hasDirectPermissionTo(String permission, User user, Group group) {
        Set<String> possiblePermissions= getUserGroupPermissions(user,group);
        return possiblePermissions.stream().anyMatch(p-> p.equalsIgnoreCase(permission)); //
    }
    // Get all the permissions the user have in a certain group
    public static Set<String> getUserGroupPermissions(User user, Group group){
        Set<String> permissionsAllowed = new HashSet<>();
        Set<String> usersAssignedRoles = findUserRoles(user,group);
        if(usersAssignedRoles.isEmpty()) // empty set permissions because the user have no roles in the group aka not a member
            return permissionsAllowed;
        //get every single permissions for each role that the user have.
        for(String role : usersAssignedRoles){
             permissionsAllowed.addAll(getRolePermissions(role,group));
        }
        return permissionsAllowed;
    }
    //get the permissions associated with the userRoleName in group
    public static Set<String> getRolePermissions(String userRoleName, Group group)
    {
        for(Role role : group.getRoles())
        {
            if(role.getRoleName().equalsIgnoreCase(userRoleName))
            {
                return new HashSet<String>(role.getPermissions());
            }
        }
        return new HashSet<String>(); // empty string set if the role name cant be found in the group
    }
    // find the user's role in the specified group
    public static Set<String> findUserRoles(User user, Group group){
        for(GroupMember member : group.getMembers())
        {
            // if userId matches then get all the user's role in the group
            if(member.getUserId().toString().equals(user.get_id().toString()))
                return new HashSet<String>(member.getRoles());
        }
        return new HashSet<String>(); //if user have no roles
    }

    // create map that where key is the group id and value = users permission (string) that that group
    private Map<String,Set<String>> mapGroupsToPermission(User user, GroupRepository groupRepository){
        Map<String,Set<String>> groupAccessMap = new HashMap<>();
        List<Group> enrolledGroups = groupRepository.findAllByMembersId(user.get_id());// enrolledGroups = groups that user is a member of
        Map<String, Group> allGroupMap = groupListToMap(groupRepository.findAll());
        // get all permission in the groups the user is ia member of
        for(Group group: enrolledGroups) {
            Set<String> permissions = getUserGroupPermissions(user,group);
            groupAccessMap.put(group.get_id().toString(),convertPermissions(permissions));
        }
        //assign add read to all parent groups
        Set<String> parentGroupsId = getParentGroups(enrolledGroups,allGroupMap);
        for(String parentId : parentGroupsId)
        {
            // if parent access role already exist in
            // group access map cause they are a member
            if(groupAccessMap.get(parentId)!= null)
                groupAccessMap.get(parentId).add(UserPermission.Permission.READ);
            else
                groupAccessMap.put(parentId,new HashSet<String>(Arrays.asList(UserPermission.Permission.READ)));
        }
        // if there is management role
        // then assign read access to children
        if(hasManagementRole(user,enrolledGroups)){
//            Set<String>childIds = getChildrenGroupsId(enrolledGroups,allGroupMap,user);
            for(Group enrolledGroup : enrolledGroups) {
                // if enrolled groups is a management group
                if(hasDirectPermissionTo(UserPermission.Permission.MANAGEMENT,user,enrolledGroup)){
                    // if there is management role then get all the child of that group, do this for all management groups
                    Set<String> childIds= getChildrenGroupsId(Arrays.asList(enrolledGroup),allGroupMap,user);
                    Set<String> userGroupPermissions = convertPermissions(getUserGroupPermissions(user,enrolledGroup));
                    for(String childId : childIds){
                        if (groupAccessMap.get(childId) != null)
                            groupAccessMap.get(childId).addAll(userGroupPermissions);
                        else{
                            groupAccessMap.put(childId,userGroupPermissions);
                        }
                    }
                }
            }
        }
        return groupAccessMap;
    }
    // check is user have managementRole
    private boolean hasManagementRole(User user, List<Group> enrolledGroups)
    {
        for(Group group: enrolledGroups){
            if(hasDirectPermissionTo(UserPermission.Permission.MANAGEMENT,user,group))
            {
                return true;
            }
        }
        return false;
    }
    // get the parent groups starting from the enrolled group of the user
    private Set<String> getParentGroups(List<Group> enrolledGroup, Map<String, Group> groupMap )
    {
        Set<String> parentGroups = new HashSet<>();
        return lookUp(enrolledGroup,groupMap,parentGroups);
    }
    //recursive lookup starting at the enrolled groups that the user is a member of
    private Set<String> lookUp(List<Group> groupsToCheck, Map<String, Group> groupMap, Set<String> resultSet)
    {
        //base case: nothing to check anymore
        if(groupsToCheck.isEmpty())
            return resultSet;
        //This is the parents directly above the current groups that are being checked
        List<Group> currentParentGroups = new ArrayList<>();

        for(Group group : groupsToCheck)
        {
            if(group != null && group.getParentGroupId() != null) // if there is a parent
            {
                String parentId = group.getParentGroupId().toString();
                Group parentGroup = groupMap.get(parentId);
                resultSet.add(parentId);
                currentParentGroups.add(parentGroup); // add to currentParentGroup so it can be used recursively check for more parents
            }
        }
        return lookUp(currentParentGroups,groupMap,resultSet);
    }
    // convert a list of groups to a map of group ids to group
    private Map<String, Group> groupListToMap(List<Group> allGroups)
    {
        Map<String, Group> groupMap = new HashMap<>();
        allGroups.forEach(group -> groupMap.put(group.get_id().toString(),group));
        return groupMap;
    }
    //get all the child group
    private Set<String> getChildrenGroupsId(List<Group> enrolledGroup, Map<String, Group> allGroupsMap, User user)
    {
        Set<String> childrenGroups = new HashSet<>();
        Set<String> managementGroupIds = getManagementGroupIds(enrolledGroup,user);
        return  lookForChildren(managementGroupIds,allGroupsMap,childrenGroups);
    }

    private Set<String> getManagementGroupIds(List<Group> enrolledGroups, User user)
    {
        Set<String> parentIds = new HashSet<>();
        for(Group group: enrolledGroups)
        {
            if(hasDirectPermissionTo(UserPermission.Permission.MANAGEMENT,user,group)) // has Management permission
            {
                parentIds.add(group.get_id().toString());
            }
        }
        return parentIds;
    }
    //recursive look down for childrens via breath first search
    private Set<String> lookForChildren (Set<String> parentIds, Map<String, Group> allGroupsMap, Set<String> resultSet)
    {
        //base case = no groups to check anymore;
        if (parentIds.isEmpty())
            return resultSet;

        Set<String> currentChildrenIds = new HashSet<>();
        for(String groupId : allGroupsMap.keySet())
        {
            Group possibleChildGroup = allGroupsMap.get(groupId);
            if(isChildOf(parentIds,possibleChildGroup)) // if parent id is the same
            {
                currentChildrenIds.add(groupId);
                resultSet.add(groupId);
            }
        }
        return lookForChildren(currentChildrenIds,allGroupsMap,resultSet);
    }
    //check if a group is a child of a list of parent group ids
    private boolean isChildOf(Set<String>parentGroupIds, Group childGroup){
        for(String parentId: parentGroupIds)
        {
            if(isChildOf(parentId,childGroup))
                return true;
        }
        return false;
    }
    //check is group has parent that is specified by parentId
    private boolean isChildOf(String parentId, Group childGroup) {
        if(childGroup.getParentGroupId() == null)
            return false;
       return childGroup.getParentGroupId().toString().equals(parentId);
    }

    private Set<String> convertPermissions (Set<String> permissions){
        Set<String> result = new HashSet<>();
        for (String permission: permissions){
            if(permission.equalsIgnoreCase(UserPermission.Permission.READ))
                result.add(UserPermission.Permission.READ);
            else if (permission.equalsIgnoreCase(UserPermission.Permission.WRITE))
                result.add(UserPermission.Permission.WRITE);
            else if (permission.equalsIgnoreCase(UserPermission.Permission.DELETE))
                result.add(UserPermission.Permission.DELETE);
            else if (permission.equalsIgnoreCase(UserPermission.Permission.EXECUTE))
                result.add(UserPermission.Permission.EXECUTE);
            else if (permission.equalsIgnoreCase(UserPermission.Permission.MANAGEMENT))
                result.add(UserPermission.Permission.MANAGEMENT);
        }
            return result;
    }
}

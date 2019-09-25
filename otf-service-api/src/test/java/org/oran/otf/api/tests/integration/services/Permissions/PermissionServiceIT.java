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


package org.oran.otf.api.tests.integration.services.Permissions;

import org.oran.otf.api.Application;
import org.oran.otf.api.tests.shared.MemoryDatabase;
import org.oran.otf.common.model.Group;
import org.oran.otf.common.model.GroupMember;
import org.oran.otf.common.model.User;
import org.oran.otf.common.repository.GroupRepository;
import org.oran.otf.common.utility.permissions.PermissionChecker;
import org.oran.otf.common.utility.permissions.PermissionUtil;
import org.oran.otf.common.utility.permissions.UserPermission;
import org.bson.types.ObjectId;
import org.junit.*;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.*;

@RunWith(SpringRunner.class)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {
                Application.class,
        })
@TestPropertySource("classpath:application-test.properties")
@ActiveProfiles("test")
public class PermissionServiceIT {
    @Autowired
    private GroupRepository groupRepository;
    private List<Group> groups;
    private Group parentGroup;
    private Group firstChildGroup;
    private Group childOfChildGroup;

    @BeforeClass
    public static void setUp() throws Exception{
        MemoryDatabase.setup();
        MemoryDatabase.createGroupsForPermission();
    }
    @Before
    public void setUpGroups()
    {
        groups = groupRepository.findAll();
        parentGroup = groupRepository.findFirstByGroupName("parent group");
        firstChildGroup = groupRepository.findFirstByGroupName("first child group");
        childOfChildGroup = groupRepository.findFirstByGroupName("child of child group");
    }
    @AfterClass
    public static void cleanup(){
        MemoryDatabase.cleanup();
    }
    /*
     if this test failed there was a error during set up so ignore the failures produced by other tests til this pass
    */
    @Test
    public void setUpTest(){
        List<Group> groups = groupRepository.findAll();
        parentGroup = groupRepository.findFirstByGroupName("parent group");
        firstChildGroup = groupRepository.findFirstByGroupName("first child group");
        childOfChildGroup = groupRepository.findFirstByGroupName("child of child group");
        Assert.assertNotNull(groups);
        Assert.assertFalse(groups.isEmpty());

        Assert.assertNotNull(parentGroup.getMembers());
        Assert.assertFalse(parentGroup.getMembers().isEmpty());
        Assert.assertNotNull(parentGroup.getRoles());
        Assert.assertFalse(parentGroup.getRoles().isEmpty());

        Assert.assertNotNull(firstChildGroup.getMembers());
        Assert.assertFalse(firstChildGroup.getMembers().isEmpty());
        Assert.assertNotNull(firstChildGroup.getRoles());
        Assert.assertFalse(firstChildGroup.getRoles().isEmpty());

        Assert.assertNotNull(childOfChildGroup.getMembers());
        Assert.assertFalse(childOfChildGroup.getMembers().isEmpty());
        Assert.assertNotNull(childOfChildGroup.getRoles());
        Assert.assertFalse(childOfChildGroup.getRoles().isEmpty());
        // all groups are set up with 1 member in memory db
        Assert.assertEquals(1,parentGroup.getMembers().size());
        Assert.assertEquals(1,firstChildGroup.getMembers().size());
        Assert.assertEquals(1,childOfChildGroup.getMembers().size());
    }
    @Test
    public void findUserRoles(){
        GroupMember parentMember = parentGroup.getMembers().get(0);
        GroupMember firstChildMember = firstChildGroup.getMembers().get(0);
        GroupMember childOfChildMember = childOfChildGroup.getMembers().get(0);

        User parentUserMock = Mockito.mock(User.class);
        User firstChildUserMock = Mockito.mock(User.class);
        User childOfChildUserMock = Mockito.mock(User.class);

        Mockito.when(parentUserMock.get_id()).thenReturn(parentMember.getUserId());
        Mockito.when(firstChildUserMock.get_id()).thenReturn(firstChildMember.getUserId());
        Mockito.when(childOfChildUserMock.get_id()).thenReturn(childOfChildMember.getUserId());

        Set<String> parentMemberRoles = PermissionUtil.findUserRoles(parentUserMock, parentGroup);
        Set<String> firstChildRoles = PermissionUtil.findUserRoles(firstChildUserMock, firstChildGroup);
        Set<String> childOfChildRoles = PermissionUtil.findUserRoles(childOfChildUserMock, childOfChildGroup);

        // all group members should only have 1 role (admin) set up except first child
        Assert.assertEquals(1,parentMemberRoles.size());
        Assert.assertTrue(parentMemberRoles.contains("admin"));
        Assert.assertEquals(2,firstChildRoles.size());
        Assert.assertTrue(firstChildRoles.contains("admin"));
        Assert.assertTrue(firstChildRoles.contains("dev"));
        Assert.assertEquals(1,childOfChildRoles.size());
        Assert.assertTrue(childOfChildRoles.contains("executor"));

        Assert.assertFalse(parentMemberRoles.contains("executor"));
        Assert.assertFalse(firstChildRoles.contains("executor"));
        Assert.assertFalse("should not have admin roles in child of child", childOfChildRoles.contains("admin"));
    }
    @Test
    public void getRolePermissionsTest()
    {
        ObjectId firstChildId =firstChildGroup.getMembers().get(0).getUserId();
        User firstChildUserMock = Mockito.mock(User.class);
        Mockito.when(firstChildUserMock.get_id()).thenReturn(firstChildId);
        Set<String> roles = PermissionUtil.findUserRoles(firstChildUserMock,firstChildGroup); //dev and admin roles only

        Assert.assertEquals(2,roles.size());
        for(String role : roles){
            Set<String> permissions = PermissionUtil.getRolePermissions(role,parentGroup);
            Assert.assertTrue("all permissions allowed except execute and delete",permissions.contains("READ"));
            Assert.assertTrue("all permissions allowed except execute and delete",permissions.contains("WRITE"));
            Assert.assertFalse("all permissions allowed except execute and delete",permissions.contains("DELETE"));
            Assert.assertFalse("all permissions allowed except execute and delete",permissions.contains("EXECUTE"));
        }
    }
    @Test
    public void getUserGroupPermissionTest(){
        GroupMember firstChildMember = firstChildGroup.getMembers().get(0);
        User firstChildUser = Mockito.mock(User.class);
        Mockito.when(firstChildUser.get_id()).thenReturn(firstChildMember.getUserId());
        Set<String> permissions = PermissionUtil.getUserGroupPermissions(firstChildUser,firstChildGroup); // should include everything except execute and delete

        Assert.assertEquals(3,permissions.size());
        Assert.assertTrue("all permissions allowed except execute and delete",permissions.contains("READ"));
        Assert.assertTrue("all permissions allowed except execute and delete",permissions.contains("WRITE"));
        Assert.assertFalse("all permissions allowed except execute and delete",permissions.contains("DELETE"));
        Assert.assertFalse("all permissions allowed except execute and delete",permissions.contains("EXECUTE"));
        Assert.assertTrue("all permissions allowed except execute and delete",permissions.contains("MANAGEMENT"));
    }

    @Test
    public void hasPermissionToTest(){
        GroupMember parentMember = parentGroup.getMembers().get(0);
        GroupMember firstChildMember = firstChildGroup.getMembers().get(0);
        GroupMember childOfChildMember = childOfChildGroup.getMembers().get(0);

        User parentGroupUser = Mockito.mock(User.class);
        User firstChildUser = Mockito.mock(User.class);
        User childOfChildUser =Mockito.mock(User.class);
        Mockito.when(parentGroupUser.get_id()).thenReturn(parentMember.getUserId());
        Mockito.when(firstChildUser.get_id()).thenReturn(firstChildMember.getUserId());
        Mockito.when(childOfChildUser.get_id()).thenReturn(childOfChildMember.getUserId());

        String read = "read";
        String write= "write";
        String manage = "management";
        String delete = "delete";
        String execute= "execute";

        Assert.assertTrue(PermissionUtil.hasPermissionTo(read,parentGroupUser,parentGroup));
        Assert.assertTrue(PermissionUtil.hasPermissionTo(write,parentGroupUser,parentGroup));
        Assert.assertTrue(PermissionUtil.hasPermissionTo(manage,parentGroupUser,parentGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(delete,parentGroupUser,parentGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(execute,parentGroupUser,parentGroup));

        Assert.assertTrue(PermissionUtil.hasPermissionTo(read,firstChildUser,firstChildGroup));
        Assert.assertTrue(PermissionUtil.hasPermissionTo(write,firstChildUser,firstChildGroup));
        Assert.assertTrue(PermissionUtil.hasPermissionTo(manage,firstChildUser,firstChildGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(delete,firstChildUser,firstChildGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(execute,firstChildUser,firstChildGroup));

        Assert.assertFalse(PermissionUtil.hasPermissionTo(read,childOfChildUser,childOfChildGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(write,childOfChildUser,childOfChildGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(manage,childOfChildUser,childOfChildGroup));
        Assert.assertFalse(PermissionUtil.hasPermissionTo(delete,childOfChildUser,childOfChildGroup));
        Assert.assertTrue(PermissionUtil.hasPermissionTo(execute,childOfChildUser,childOfChildGroup));
    }
    @Test
    public void buildUserPermissionTest()
    {
        /*
           should be the following format
           parent members:
           parentGroup = {read,write,management}
           first Child group = {read}
           child of child group = {read}

           first child group:
           parentGroup = {read}
           first Child group = {read,write,management}
           child of child group = {read}

           child of child:
           parentGroup = {read}
           first Child group = {read}
           child of child group = {execute}
         */

        GroupMember parentMember = parentGroup.getMembers().get(0);
        GroupMember firstChildMember = firstChildGroup.getMembers().get(0);
        GroupMember childOfChildMember = childOfChildGroup.getMembers().get(0);

        User parentGroupUser = Mockito.mock(User.class);
        User firstChildUser = Mockito.mock(User.class);
        User childOfChildUser =Mockito.mock(User.class);
        Mockito.when(parentGroupUser.get_id()).thenReturn(parentMember.getUserId());
        Mockito.when(firstChildUser.get_id()).thenReturn(firstChildMember.getUserId());
        Mockito.when(childOfChildUser.get_id()).thenReturn(childOfChildMember.getUserId());

        String read = "READ";
        String write= "WRITE";
        String manage = "MANAGEMENT";
        String delete = "DELETE";
        String execute= "EXECUTE";

        UserPermission parentUserPermissions = new PermissionUtil().buildUserPermission(parentGroupUser,groupRepository);
        UserPermission firstChildUserPermissions = new PermissionUtil().buildUserPermission(firstChildUser,groupRepository);
        UserPermission childOfChildUserPermissions = new PermissionUtil().buildUserPermission(childOfChildUser,groupRepository);
        Map<String,Set<String>> parentAccessControl = parentUserPermissions.getUserAccessMap();
        Map<String,Set<String>> firstChildAccessControl = firstChildUserPermissions.getUserAccessMap();
        Map<String,Set<String>> childOfChildAccessControl = childOfChildUserPermissions.getUserAccessMap();

        //test for parent access control
        Assert.assertTrue(parentAccessControl.get(parentGroup.get_id().toString()).contains(read));
        Assert.assertTrue(parentAccessControl.get(parentGroup.get_id().toString()).contains(write));
        Assert.assertTrue(parentAccessControl.get(parentGroup.get_id().toString()).contains(manage));
        //test all access is passed to firstChildGroup
        Assert.assertTrue(parentAccessControl.get(firstChildGroup.get_id().toString()).contains(read));
        Assert.assertTrue(parentAccessControl.get(firstChildGroup.get_id().toString()).contains(write));
        Assert.assertTrue(parentAccessControl.get(firstChildGroup.get_id().toString()).contains(manage));
        //test all access is passed to child of child group
        Assert.assertTrue(parentAccessControl.get(childOfChildGroup.get_id().toString()).contains(read));
        Assert.assertTrue(parentAccessControl.get(childOfChildGroup.get_id().toString()).contains(write));
        Assert.assertTrue(parentAccessControl.get(childOfChildGroup.get_id().toString()).contains(manage));
        // make sure parent user dont have other permissions in first child group
        Assert.assertFalse(parentAccessControl.get(firstChildGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(parentAccessControl.get(firstChildGroup.get_id().toString()).contains(execute));
        //test that parent dont have other permissions in child of child group
        Assert.assertFalse(parentAccessControl.get(childOfChildGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(parentAccessControl.get(childOfChildGroup.get_id().toString()).contains(execute));

        //test for first child access control
        Assert.assertTrue(firstChildAccessControl.get(parentGroup.get_id().toString()).contains(read));
        Assert.assertTrue(firstChildAccessControl.get(firstChildGroup.get_id().toString()).contains(read));
        Assert.assertTrue(firstChildAccessControl.get(firstChildGroup.get_id().toString()).contains(write));
        Assert.assertTrue(firstChildAccessControl.get(firstChildGroup.get_id().toString()).contains(manage));
        // test that first child group get passed to child of child
        Assert.assertTrue(firstChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(read));
        Assert.assertTrue(firstChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(write));
        Assert.assertTrue(firstChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(manage));
        // make sure firstchild user dont have other permissions
        Assert.assertFalse(firstChildAccessControl.get(parentGroup.get_id().toString()).contains(write));
        Assert.assertFalse(firstChildAccessControl.get(parentGroup.get_id().toString()).contains(manage));
        Assert.assertFalse(firstChildAccessControl.get(parentGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(firstChildAccessControl.get(parentGroup.get_id().toString()).contains(execute));
        // test to confirm no extra permission is passed to child of child
        Assert.assertFalse(firstChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(firstChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(execute));

        //test for child of child access control
        Assert.assertTrue(childOfChildAccessControl.get(parentGroup.get_id().toString()).contains(read));
        Assert.assertTrue(childOfChildAccessControl.get(firstChildGroup.get_id().toString()).contains(read));
        Assert.assertTrue(childOfChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(execute));
        // make sure child of child user dont have other permissions
        Assert.assertFalse(childOfChildAccessControl.get(parentGroup.get_id().toString()).contains(write));
        Assert.assertFalse(childOfChildAccessControl.get(parentGroup.get_id().toString()).contains(manage));
        Assert.assertFalse(childOfChildAccessControl.get(parentGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(childOfChildAccessControl.get(parentGroup.get_id().toString()).contains(execute));

        Assert.assertFalse(childOfChildAccessControl.get(firstChildGroup.get_id().toString()).contains(write));
        Assert.assertFalse(childOfChildAccessControl.get(firstChildGroup.get_id().toString()).contains(manage));
        Assert.assertFalse(childOfChildAccessControl.get(firstChildGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(childOfChildAccessControl.get(firstChildGroup.get_id().toString()).contains(execute));

        Assert.assertFalse(childOfChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(write));
        Assert.assertFalse(childOfChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(manage));
        Assert.assertFalse(childOfChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(delete));
        Assert.assertFalse(childOfChildAccessControl.get(childOfChildGroup.get_id().toString()).contains(read));
    }
    @Test
    public void basicTest(){
        GroupMember parentMember = parentGroup.getMembers().get(0);
        GroupMember firstChildMember = firstChildGroup.getMembers().get(0);
        GroupMember childOfChildMember = childOfChildGroup.getMembers().get(0);

        User parentGroupUser = Mockito.mock(User.class);
        User firstChildUser = Mockito.mock(User.class);
        User childOfChildUser =Mockito.mock(User.class);
        Mockito.when(parentGroupUser.get_id()).thenReturn(parentMember.getUserId());
        Mockito.when(firstChildUser.get_id()).thenReturn(firstChildMember.getUserId());
        Mockito.when(childOfChildUser.get_id()).thenReturn(childOfChildMember.getUserId());

        Assert.assertTrue(PermissionChecker.hasPermissionTo(childOfChildUser,firstChildGroup,UserPermission.Permission.READ,groupRepository));
        Assert.assertTrue(PermissionChecker.hasPermissionTo(childOfChildUser,parentGroup,UserPermission.Permission.READ,groupRepository));
        Assert.assertFalse(PermissionChecker.hasPermissionTo(childOfChildUser,childOfChildGroup,UserPermission.Permission.READ,groupRepository));

        Assert.assertFalse(PermissionChecker.hasPermissionTo(childOfChildUser,firstChildGroup,UserPermission.Permission.EXECUTE,groupRepository));
        Assert.assertTrue(PermissionChecker.hasPermissionTo(firstChildUser,firstChildGroup,UserPermission.Permission.WRITE,groupRepository));
        Assert.assertFalse(PermissionChecker.hasPermissionTo(firstChildUser,firstChildGroup,UserPermission.Permission.EXECUTE,groupRepository));

        Assert.assertFalse(PermissionChecker.hasPermissionTo(parentGroupUser,parentGroup,UserPermission.Permission.DELETE,groupRepository));
        Assert.assertFalse(PermissionChecker.hasPermissionTo(parentGroupUser,parentGroup,UserPermission.Permission.EXECUTE,groupRepository));
        Assert.assertFalse(PermissionChecker.hasPermissionTo(parentGroupUser,firstChildGroup,UserPermission.Permission.EXECUTE,groupRepository));
    }
}

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


package org.oran.otf.api.tests.unit.utility;

import org.oran.otf.common.utility.permissions.UserPermission;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.*;

@RunWith(MockitoJUnitRunner.class)
public class UserPermissionTest {

    @Mock
    Map<String, Set<String>> userAccessMap ;

    @InjectMocks
    private UserPermission userPermission;

    @Before
    public void setUp()
    {
        String fakeGroupId1 = "abc123";
        Set<String> user1Permissions = new HashSet<>(Arrays.asList("READ","WRITE"));
        Mockito.when(userAccessMap.get(fakeGroupId1)).thenReturn(user1Permissions);
    }

    @Test
    public void testHasAccessToMethod(){

        Assert.assertNotNull(userPermission.getUserAccessMap());
        //test when user have access to group with certain permissions and a fake permission(mix of upper and lower case
        Assert.assertTrue(userPermission.hasAccessTo("abc123","READ"));
        Assert.assertTrue(userPermission.hasAccessTo("abc123","WrIte"));
        Assert.assertFalse(userPermission.hasAccessTo("abc123","DEleTE"));
        Assert.assertFalse(userPermission.hasAccessTo("abc123","ExECUTe"));
        Assert.assertFalse(userPermission.hasAccessTo("abc123","mANAgEMENT"));
        Assert.assertFalse(userPermission.hasAccessTo("abc123","READ+WRITE"));

        //test when user have no access to the group
        Assert.assertFalse(userPermission.hasAccessTo("edf567","READ"));
        Assert.assertFalse(userPermission.hasAccessTo("edf567","WRITE"));
        Assert.assertFalse(userPermission.hasAccessTo("edf567","DELETE"));
        Assert.assertFalse(userPermission.hasAccessTo("edf567","EXECUTE"));
        Assert.assertFalse(userPermission.hasAccessTo("edf567","MANAGEMENT"));
    }
}

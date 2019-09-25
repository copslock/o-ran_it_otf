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


package org.oran.otf.api.tests.unit.models;

import org.oran.otf.common.model.User;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class UserTest {

  private static User user;
  @BeforeClass
  public static void setup(){
    user = new User();
  }
  @Test
  public void testUserHasPermissionsField(){
    Assertions.assertThat(user).hasFieldOrProperty("permissions");
  }
  @Test
  public void testUserHasFirstNameField(){
    Assertions.assertThat(user).hasFieldOrProperty("firstName");
  }
  @Test
  public void testUserHasLastNameField(){
    Assertions.assertThat(user).hasFieldOrProperty("lastName");
  }
  @Test
  public void testUserHasEmailField(){
    Assertions.assertThat(user).hasFieldOrProperty("email");
  }
  @Test
  public void testUserHasPasswordField(){
    Assertions.assertThat(user).hasFieldOrProperty("password");
  }
  @Test
  public void testUserHasGroupsField(){
    Assertions.assertThat(user).hasFieldOrProperty("groups");
  }
  @Test
  public void testUserHasCreatedAtField(){
    Assertions.assertThat(user).hasFieldOrProperty("createdAt");
  }
  @Test
  public void testUserHasUpdatedAtField(){
    Assertions.assertThat(user).hasFieldOrProperty("updatedAt");
  }
}

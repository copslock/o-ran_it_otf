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

import org.oran.otf.common.model.TestHead;
import org.assertj.core.api.Assertions;
import org.junit.BeforeClass;
import org.junit.Test;

public class HeadTest {
  private static TestHead testHead;

  @BeforeClass
  public static void setup(){
    testHead = new TestHead();
  }
  @Test
  public void testHeadHasTestHeadNameField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("testHeadName");
  }
  @Test
  public void testHeadHasTestHeadDescriptionField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("testHeadDescription");
  }
  @Test
  public void testHeadHasHostNameField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("hostname");
  }
  @Test
  public void testHeadHasPortField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("port");
  }
  @Test
  public void testHeadHasResourcePathField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("resourcePath");
  }
  @Test
  public void testHeadHasCreatorIdField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("creatorId");
  }
  @Test
  public void testHeadHasGroupIdField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("groupId");
  }
  @Test
  public void testHeadHasCreatedAtField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("createdAt");
  }
  @Test
  public void testHeadHasUpdatedAtField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("updatedAt");
  }
  @Test
  public void testHeadHasUpdatedByField(){
    Assertions.assertThat(testHead).hasFieldOrProperty("updatedBy");
  }

}

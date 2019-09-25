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

import org.oran.otf.api.Utilities;
import org.oran.otf.common.model.local.OTFApiResponse;
import org.junit.Assert;
import org.junit.Test;

import javax.ws.rs.core.Response;

public class BuildResponseTest {
    @Test
    public void badResponseTest(){
        Response badResponse = Utilities.Http.BuildResponse.badRequest();
        Assert.assertNotNull(badResponse);
        Assert.assertEquals(badResponse.getStatus(),400);
    }

    @Test
    public void badRequestWithMessageTest() {
        Response badResponse = Utilities.Http.BuildResponse.badRequestWithMessage("this is bad");
        OTFApiResponse response = (OTFApiResponse) badResponse.getEntity();

        Assert.assertNotNull(badResponse);
        Assert.assertEquals(badResponse.getStatus(),400);
        Assert.assertEquals(response.getStatusCode(), 400);
        Assert.assertEquals(response.getMessage(), "this is bad");
    }
    @Test
    public void internalServerErrorTest(){
        Response badResponse = Utilities.Http.BuildResponse.internalServerError();
        Assert.assertNotNull(badResponse);
        Assert.assertEquals(badResponse.getStatus(),500);
    }
    @Test
    public void internalServerErrorWithMessageTest(){
        Response badResponse = Utilities.Http.BuildResponse.internalServerErrorWithMessage("internal error");
        OTFApiResponse response = (OTFApiResponse) badResponse.getEntity();

        Assert.assertNotNull(badResponse);
        Assert.assertEquals(badResponse.getStatus(),500);
        Assert.assertEquals(response.getStatusCode(), 500);
        Assert.assertEquals(response.getMessage(), "internal error");
    }

    @Test
    public void unauthorizedTest(){
        Response basicUnauthorizedResponse=  Utilities.Http.BuildResponse.unauthorized();
        Response unauthorizedMsgResponse = Utilities.Http.BuildResponse.unauthorizedWithMessage("unauthorized");
        OTFApiResponse response = (OTFApiResponse) unauthorizedMsgResponse.getEntity();

        Assert.assertNotNull(basicUnauthorizedResponse);
        Assert.assertNotNull(unauthorizedMsgResponse);
        Assert.assertEquals(basicUnauthorizedResponse.getStatus(),401);
        Assert.assertEquals(unauthorizedMsgResponse.getStatus(),401);
        Assert.assertEquals(response.getStatusCode(),401);
        Assert.assertEquals(response.getMessage(),"unauthorized");
    }
}

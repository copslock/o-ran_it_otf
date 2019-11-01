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


const {
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
    TokenCredential,
    ContainerURL
  } = require("@azure/storage-blob");

module.exports = function(app) {
    // Enter your storage account name and shared key
    const account = app.get('azure').storage.account;
    const accountKey = app.get('azure').storage.key;
    const container = app.get('azure').storage.container;
  
    // Use SharedKeyCredential with storage account and account key
    const sharedKeyCredential = new SharedKeyCredential(account, accountKey);
  
    // Use TokenCredential with OAuth token
    const tokenCredential = new TokenCredential("token");
    tokenCredential.token = "renewedToken"; // Renew the token by updating token field of token credential
  
    // Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
    const pipeline = StorageURL.newPipeline(sharedKeyCredential);
  
    // List containers
    const serviceURL = new ServiceURL(
      // When using AnonymousCredential, following url should include a valid SAS or support public access
      `https://${account}.blob.core.windows.net`,
      pipeline
    );

    const containerURL = ContainerURL.fromServiceURL(serviceURL, container);

    app.set('azureStorageContainerUrl', containerURL);
}
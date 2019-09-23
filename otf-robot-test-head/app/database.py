""" Copyright (c) 2019 AT&T Intellectual Property.                             #
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
#############################################################################"""


import os
from urllib import quote_plus

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure


class DatabaseConfiguration:
    def __init__(self):
        # read environment variables containing information for the MongoDB replica set.
        MONGO_HOST = os.environ['OTF_MONGO_HOSTS']
        MONGO_USERNAME = os.environ['OTF_MONGO_USERNAME']
        MONGO_PASSWORD = os.environ['OTF_MONGO_PASSWORD']
        MONGO_REPLICA_SET = os.environ['OTF_MONGO_REPLICASET']
        MONGO_DATABASE = os.environ['OTF_MONGO_DATABASE']

        # form the connection string for connection to a MongoDB replica set.
        uri = "mongodb://%s:%s@%s?replicaSet=%s" % (
            quote_plus(MONGO_USERNAME),
            quote_plus(MONGO_PASSWORD),
            MONGO_HOST + MONGO_DATABASE,
            MONGO_REPLICA_SET
        )

        client = MongoClient(uri)

        try:
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            print("Established connection to MongoDB.")
            self.database = client[MONGO_DATABASE]
        except ConnectionFailure:
            print("Failed to initialize connection to MongoDB.")

    def set_database(self, database):
        self.database = database

    def get_database(self):
        return self.database

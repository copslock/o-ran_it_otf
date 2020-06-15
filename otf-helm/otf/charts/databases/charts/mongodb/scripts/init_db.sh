#!/bin/bash

sleep 10;
mongoimport -c=users -d=otf --mode=upsert --username=otfuser --password=Today.123 --file=/data/scripts/users.json
mongoimport -c=users -d=otf --mode=upsert --username=otfuser --password=Today.123 --file=/data/scripts/groups.json

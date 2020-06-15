#!/bin/bash

sleep 20;
mysql -u otfuser otf_camunda -pToday.123 < /data/scripts/mysql_engine_7.10.0.sql
mysql -u otfuser otf_camunda -pToday.123 < /data/scripts/mysql_identity_7.10.0.sql


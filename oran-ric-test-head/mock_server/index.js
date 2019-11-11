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

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/appmgr/ric/v1/health/ready',function(req,res){
    res.sendStatus(200)
})

app.get('/appmgr/ric/v1/health/alive',function(req,res){
    res.sendStatus(200)
})

app.get('/appmgr/ric/v1/xapps',function(req,res){
    res.status(200)
    res.send([{"name":"admin-xapp","status":"deployed","version":"1.0","instances":null},{"name":"mcxapp","status":"deployed","version":"1.0","instances":[{"name":"mcxapp-649d7494-h5tjb","status":"running","ip":"service-ricxapp-mcxapp-rmr.ricxapp","port":4560,"txMessages":null,"rxMessages":["RIC_SUB_RESP","RIC_SUB_FAILURE","RIC_SUB_DEL_RESP","RIC_SUB_DEL_FAILURE","RIC_INDICATION"]}]},{"name":"ueec","status":"deployed","version":"1.0","instances":[{"name":"ueec-6675694b75-jtnz6","status":"running","ip":"service-ricxapp-ueec-rmr.ricxapp","port":4560,"txMessages":["RIC_SUB_REQ","RIC_SUB_DEL_REQ"],"rxMessages":["RIC_SUB_RESP","RIC_SUB_FAILURE","RIC_SUB_DEL_RESP","RIC_SUB_DEL_FAILURE","RIC_INDICATION"]}]}])
})

app.post('/appmgr/ric/v1/xapps', function(req,res){
    res.statusMessage = 'Created'
    res.status(201)
    res.send({"result_output":{"name":"anr","status":"deployed","version":"1.0","instances":[{"name":"anr-7d4c47b4bb-jlslm","status":"running","ip":"service-ricxapp-anr-rmr.ricxapp","port":4560,"txMessages":null,"rxMessages":["RIC_SGNB_ADDITION_REQ","RIC_RRC_TRANSFER"]}]}})
})

app.delete('/appmgr/ric/v1/xapps/:name',function(req,res){
    res.sendStatus(204)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


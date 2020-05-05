const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/a1-p/healthcheck',function(req,res){
    console.log("health checking")
    res.sendStatus(200)
})

app.get('/a1-p/policytypes',function(req,res){
    res.status=(200)
    res.send([20000, 20020])
})

app.get('/a1-p/policytypes/:policy_type_id',function(req,res){
    res.status=(200)
    policy_type_id = req.params['policy_type_id']
    res.send({"name": "example policy instance","description":"fake description","policy_type_id": policy_type_id,"create_schema":"{name:sample object}"})
})
app.delete('/a1-p/policytypes/:policy_type_id',function(req,res){
    res.sendStatus(204)
})

app.put('/a1-p/policytypes/:policy_type_id',function(req,res){
    console.log(req.body)
    res.sendStatus(201)
})

app.get('/a1-p/policytypes/:policy_type_id/policies',function(req,res){
    console.log('listing policies')
    res.status=(200)
    res.send(["3d2157af-6a8f-4a7c-810f-38c2f824bf12", "06911bfc-c127-444a-8eb1-1bffad27cc3d"])
})

app.get('/a1-p/policytypes/:policy_type_id/policies/:policy_instance_id',function(req,res){
    res.status=(200)
    policy_type_id = req.params['policy_type_id']
    policy_instance_id = req.params['policy_instance_id']
    res.send({"name": "example policy instance","description":"fake description","policy_type_id": policy_type_id,"create_schema":"{name:sample object}"})
})
app.delete('/a1-p/policytypes/:policy_type_id/policies/:policy_instance_id',function(req,res){
    res.sendStatus(202)
})

app.put('/a1-p/policytypes/:policy_type_id/policies/:policy_instance_id',function(req,res){
    console.log(req.body)
    res.sendStatus(202)
})

app.get('/a1-p/policytypes/:policy_type_id/policies/:policy_instance_id/status',function(req,res){
    res.status(200)
    res.send({"properties":{"instance_status": "fake status","enum": "IN EFFECT"}})
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


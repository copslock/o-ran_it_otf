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


// Node.js modules
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Express.js modules
const express = require('@feathersjs/express');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const favicon = require('serve-favicon');

// Feathers.js modules
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const socketio = require('@feathersjs/socketio'); //require('@feathersjs/socketio-client'); 
const io = require('socket.io'); //socket.io-client
const socket = io();

const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const authentication = require('./authentication');

// Azure Storage
const azureStorage = require('../lib/azure-storage');

// Mongoose
const mongoose = require('../lib/mongoose');
const _mongoose = require('mongoose');

// Mongoose Plugins
const { accessibleRecordsPlugin, accessibleFieldsPlugin } = require('@casl/mongoose');
_mongoose.plugin(accessibleFieldsPlugin);
_mongoose.plugin(accessibleRecordsPlugin);

// Winston
const logger = require('../lib/logger');

// Redis
const redis = require('redis');

// Create a Express/Feathers application
const app = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio(function (io) {
	io.on('connection', (socket) => {
		console.log('someone has connected')
		io.emit('message', "HI from nodejs");
	});
	// Registering Socket.io middleware
	io.use(function (socket, next) {
		// Exposing a request property to services and hooks
		socket.feathers.referrer = socket.request.referrer;
		next();
	});
}))
//app.configure(socketio());

// const subscribe = redis.createClient(6379, 'localhost');
// subscribe.subscribe('otf.execution.queue');

// subscribe.on('connect', function () {
// 	console.log("Connected to reids server")
// })

// subscribe.on('message', function (channel, message) {
// 	console.log('Channel: ' + channel + ', Message: ' + message);
// 	//client.sent(message);
// });

// io.on('connection', (socket) => {
// 	console.log('user connected');

// 	socket.on('message', (message) => {
// 		console.log("Message Received: " + message);
// 		io.emit('message', {type: 'new-message', text: message})
// 	});
// });

// Configure Azure storage
app.configure(azureStorage);

// Configure Mongoose driver before setting up services that use Mongoose
app.configure(mongoose);
// Set up database dependent components once the connection is ready to prevent unexpected results
_mongoose.connection.on('open', (ref) => {
	app.configure(authentication);

	// Set up our services (see `services/index.js`)
	app.configure(services);
	// Set up event channels (see channels.js)
	app.configure(channels);

	const userInterfacePath = path.join(__dirname, '..', '..', '..', 'client', 'dist');

	app.use('/', express.static(userInterfacePath));

	app.all('/*', function (req, res) {
		res.sendFile(path.join(userInterfacePath, 'index.html'), function (err) {
			if (err) {
				res.status(500).send('Internal Server Error - This incident has been reported.');
				logger.error(JSON.stringify(err));
			}
		});
	});

	// Configure a middleware for 404s and the error handler
	app.use(express.notFound());
	app.use(express.errorHandler({ logger }));

	app.hooks(appHooks);

	const port = app.get('port');
	const useSSL = app.get('ssl');
	var server = null;

	if(useSSL){
		// set up server with ssl (https)
		const certDirPath = path.join(__dirname, '..', '..', '..', 'server', 'config', 'cert');

		server = https.createServer({
			key: fs.readFileSync(path.normalize(certDirPath + path.sep + 'privateKey.pem')),
			cert: fs.readFileSync(path.normalize(certDirPath + path.sep + 'otf.pem'))
		}, app).listen(port);
	}else{
		// set up server without ssl (http)
		server = http.createServer(app).listen(port);
	}

	app.setup(server);

	process.on('unhandledRejection', (reason, p) =>
		logger.error('Unhandled Rejection at: Promise ', p, reason)
	);

	server.on('listening', () =>
		logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
	);
});

module.exports = app;

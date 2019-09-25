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


const { createLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, label, simple, colorize, splat, printf } = format;
const cluster = require('cluster');

const getLabel = function () {
	if (cluster.isMaster) return 'OTF-master';
	return 'OTF-worker-' + cluster.worker.id;
};

const config = {
	levels: {
		error: 0,
		debug: 1,
		warn: 2,
		data: 3,
		info: 4,
		verbose: 5,
		silly: 6,
		custom: 7
	},
	colors: {
		error: 'red',
		debug: 'blue',
		warn: 'yellow',
		data: 'grey',
		info: 'green',
		verbose: 'cyan',
		silly: 'magenta',
		custom: 'yellow'
	}
};

addColors(config.colors);

const logFormat = printf(info => {
	return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = module.exports = createLogger({
	levels: config.levels,
	format: combine(
		label({ label: getLabel() }),
		timestamp(),
		splat(),
		colorize(),
		simple(),
		logFormat
	),
	transports: [
		new transports.Console()
	],
	level: 'custom'
});

module.exports = logger;

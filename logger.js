/* global require, module, process */
var winston = require('winston');
require('winston-loggly');

winston.addColors({
	info: 'blue',
	warn: 'yellow',
	error: 'red'
});

var loggerSingleton;

function newLogger() {
	loggerSingleton = new (winston.Logger)({
		transports: [
				new (winston.transports.Console)({
					name: 'Console',
					colorize:'all',
					level:'debug'
				}),
				new (winston.transports.Loggly)({
					name: 'Loggly',
					token: process.env.LOGGLY_TOKEN,
					subdomain: "devtanc",
					tags: ["Budget-Server", process.env.LOGGLY_ENV_TAG],
					json:true,
					colorize:'all'
				})
			]
	});
	return loggerSingleton;
}

module.exports.getLogger = loggerSingleton ? loggerSingleton : newLogger();

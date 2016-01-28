/* global require, module, process */
var winston = require('winston');
require('winston-loggly');

winston.addColors({
	info: 'blue',
	warn: 'yellow',
	error: 'red'
});

module.exports = new (winston.Logger)({
	transports: [
			new (winston.transports.Console)({
				name: 'Console',
				colorize:'all'
			}),
			new (winston.transports.Loggly)({
				name: 'Loggly',
				token: process.env.LOGGLY_TOKEN,
				subdomain: "devtanc",
				tags: ["Budget-Server"],
				json:true,
				colorize:'all'
			})
		]
});


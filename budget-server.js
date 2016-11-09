/* global require, process, __dirname */
require('config-envy')({
	env: process.env.NODE_ENV  || 'development',
	cwd: process.cwd(),
	localEnv: '.env',
	overrideProcess: false,
	silent: false,
});
console.log('Running in ' + (process.env.NODE_ENV || 'development') + ' mode');
require('winston-loggly');

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('./server/logger.js').getLogger;
var twilio = require('./server/twilio.js');
var CronJob = require('cron').CronJob;

new CronJob({
	cronTime: '00 00 08 * * 5',
	onTick: function() {
		logger.info('Ran CronJob! Time is:', new Date().toISOString()); //ADD CALCULATION FUNCTION HERE
	},
	start: true,
	timeZone: 'America/Denver',
	runOnInit: true
});

var app = express();

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.sendFile('index.html');
});

//Add API endpoints
require('./server/routes.js')(app);

var PORT_NUMBER = process.env.PORT || 3030;
app.listen(PORT_NUMBER, function() {
	logger.log('info', 'Listening on port: ' + PORT_NUMBER);
});

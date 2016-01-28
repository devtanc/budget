/* global require, process, __dirname, setInterval, setTimeout */
require('config-envy')({
	env: process.env.NODE_ENV  || 'development',
	cwd: process.cwd(),
	localEnv: '.env',
	overrideProcess: false,
	silent: false,
});
require('winston-loggly');

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var payChecker = require('./paycheckDate.js');
var logger = require('./logger.js');
var app = express();

var currentHour = new Date().getHours();
var TIMEOUT = 0;
if (currentHour <= 7 &&
	 currentHour >= 6) {
	TIMEOUT = 0;
} else if (currentHour < 6) {
	TIMEOUT = (6 - currentHour) * 3600000;
} else {
	TIMEOUT = (24 - currentHour + 6) * 3600000;
}

logger.log('info', 'Timeout for first run of checker function: ' +
					 TIMEOUT + 'ms (or ' + (TIMEOUT / 1000 / 60 / 60) + ' hours)');

setTimeout(function() {
	payChecker();
	setInterval(payChecker, process.env.PAY_CHECKER_TIMEOUT);
}, TIMEOUT);


var PORT_NUMBER = process.env.PORT_NUMBER || 3030;

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.sendFile('index.html');
});

//API endpoints
var couchConfig = {
	baseUrl: process.env.DB_BASE_URL + '/',
	db: 'regular_payments'
};

app.post('/api/get', function(req, res) { //Gets item from db
	logger.log('API GET request received', req);
	//Parse queryParams into query parameters on the url
	var builtUri = couchConfig.db + '/_design/views/_view/' + req.body.view;
	if (req.body.queryParams) {
		builtUri += '?';
		var paramArray = Object.keys(req.body.queryParams);
		paramArray.forEach(function(element, index) {
			builtUri += element + '=' + req.body.queryParams[element];
			if (index != paramArray.length - 1) {
				builtUri += '&';
			}
		});
	}
	logger.log('URI built: ' + builtUri);
	//Send GET request with constructed URL
	request.get({
		baseUrl: couchConfig.baseUrl,
		uri: builtUri,
		json: true
	}, function(err, response, body) {
		if (err) {
			console.log(err);
			res.status(404).end(err);
		}
		else {
			if(body.error) {
				throw body.error;
			} else {
				console.log("Obtained " + body.rows.length + " items");
				console.log(body.rows[0]);
				res.status(200).json(body).end(); //Return JSON received from DB
			}
		}
	});
});

app.post('/api', function(req, res) { //Creates new items in couchdb
	logger.log('API POST request received', req);
	request.post({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			res.status(200).json(body);
		}
	});
});

app.put('/api', function(req, res) { //Modifies items in couchdb
	logger.log('API PUT request received', req);
	var _id = req.body._id;
	delete req.body._id;
	var _rev = req.body._rev;
	delete req.body._rev;
	request.put({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db + '/' + _id,
		body: req.body,
		json: true,
		headers: {
			'If-Match': _rev
		}
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			res.status(200).json(body);
		}
	});
});

app.listen(PORT_NUMBER, function() {
	logger.log('info', 'Listening on port: ' + PORT_NUMBER);
});

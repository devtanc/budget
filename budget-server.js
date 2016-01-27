/* global require, process, __dirname */

require('config-envy')({
	env: process.env.NODE_ENV,
	cwd: process.cwd(),
	localEnv: '.env',
	overrideProcess: false,
	silent: false,
});

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

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
	console.log('API GET request received');
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
	console.log(builtUri);
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
	console.log('API POST request received');
	request.post({
		baseUrl: couchConfig.baseUrl,
		uri: couchConfig.db,
		body: req.body,
		json: true
	}, function(err, response, body) {
		if (err) { console.log(err); }
		else {
			console.log(body);
			res.status(200).json(body);
		}
	});
});

app.put('/api', function(req, res) { //Modifies items in couchdb
	console.log('API PUT request received');
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
			console.log(body);
			res.status(200).json(body);
		}
	});
});

app.listen(PORT_NUMBER, function() {
	console.log('Listening on port: ' + PORT_NUMBER);
});

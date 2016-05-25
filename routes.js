/* global module, require */
var logger = require('./logger.js').getLogger;
var dynamo = require('./dynamo.js');
var moment = require('moment');

module.exports = function(server) {
	server.get('/api/txt', function(req, res) {
		//Unused currently. Needs to be exposed to the web for use.
		//This endpoint would handle texts FROM users to the budget app
		res.sendStatus(200);
	});

	server.post('/api/getExpensesStarting/:date', function(req, res) {
		var date = moment(req.params.date);
		res.sendStatus(200);
	});

	server.post('/api/createExpense', function(req, res) {
		dynamo.put({
			Item: req.body
		}).then(function(data) {
			logger.info('New item expense added to dynamo: ' + data);
			res.sendStatus(200);
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.post('/api/updateExpense', function(req, res) {
		//May already have?
		res.sendStatus(200);
	});

	server.post('/api/deleteExpense', function(req, res) {
		//May already have? Use DELETE method instead?
		res.sendStatus(200);
	});

	server.get('/api/getExpensesThisPayPeriod', function(req, res) {
		//Redirect to getExpensesStarting with current pay period start date as date
		res.sendStatus(200);
	});

	server.get('/api/getAllExpenses/:recurrance', function(req, res) {
		var recurrance = req.params.recurrance;
		res.sendStatus(200);
	});

	server.get('/api/getAllExpenses', function(req, res) {
		dynamo.queryAll().then(function(data) {
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.get('/api/getExpense/:recurrence/:creationDate', function(req, res) {
		dynamo.get(req.params.recurrence, req.params.creationDate).then(function(data) {
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});
};

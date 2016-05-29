/* global module, require */
var logger = require('./logger.js').getLogger;
var dynamo = require('./dynamo.js');
var moment = require('moment');
var expenses = require('./expenses.js');
var paycheck = require('./paycheck.js');
var format = 'YYYY-MM-DD';

module.exports = function(server) {
	server.get('/api/txt', function(req, res) {
		//Unused currently. Needs to be exposed to the web for use.
		//This endpoint would handle texts FROM users to the budget app
		res.sendStatus(404);
	});

	server.get('/api/getExpensesThisPaycheck', function(req, res) { //Add paycheck info
		var thisPaycheck = paycheck.getPaycheck(moment().format(format));
		res.redirect('/api/getExpensesStarting/' + thisPaycheck.start);
	});

	server.get('/api/getExpensesStarting/:date', function(req, res) { //Add paycheck info
		var date = moment(req.params.date, format);
		expenses.getFilteredExpenses({
			start: date,
			end: moment(date).add(14, 'days')
		}).then(function(data) {
			logger.info('Returned [' + data.length + '] expenses starting: ' + date.format('YYYY-MM-DD'));
			res.status(200).json({
				expenses: data,
				paycheckStart: date,
				paycheckEnd: moment(date).add(14, 'days')
			}).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.post('/api/createExpense', function(req, res) {
		dynamo.put({
			Item: req.body
		}).then(function() {
			logger.info('New item expense added to dynamo: ' + JSON.stringify(req.body));
			res.sendStatus(200);
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.post('/api/updateExpense', function(req, res) {
		dynamo.update(req.body).then(function(data) {
			logger.info('Expense updated' + JSON.stringify(data));
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.delete('/api/deleteExpense', function(req, res) {
		dynamo.delete(req.body.primary, req.body.secondary).then(function() {
			logger.info('Item deleted: [' + req.body.primary + ', ' + req.body.secondary + ']');
			res.status(200).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.get('/api/getAllExpenses/:recurrence', function(req, res) {
		expenses.getAllExpenses(req.params.recurrence).then(function(data) {
			logger.info('Retrieved all [' + data.length + '] expenses with recurrence type: ' + req.params.recurrence);
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
		res.sendStatus(200);
	});

	server.get('/api/getAllExpenses', function(req, res) {
		expenses.getAllExpenses().then(function(data) {
			logger.info('Retrieved all [' + data.length + '] expenses');
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});

	server.get('/api/getExpense/:recurrence/:creationDate', function(req, res) {
		dynamo.get(req.params.recurrence, req.params.creationDate).then(function(data) {
			logger.info('Retrieved expense: ' + JSON.stringify(data));
			res.status(200).json(data).end();
		}).catch(function(err) {
			logger.error(err);
			res.status(500).json(err).end();
		});
	});
};

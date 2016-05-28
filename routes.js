/* global module, require */
var logger = require('./logger.js').getLogger;
var dynamo = require('./dynamo.js');
var moment = require('moment');
var expenses = require('expenses.js');
var paycheck = require('./paycheck.js');

module.exports = function(server) {
  server.get('/api/txt', function(req, res) {
    //Unused currently. Needs to be exposed to the web for use.
    //This endpoint would handle texts FROM users to the budget app
    res.sendStatus(200);
  });

  server.get('/api/getExpensesThisPaycheck', function(req, res) {
    expenses.getExpensesIn(paycheck.getPaycheck(moment())).then(function(expenses){

    }).catch(function(err) {

    });
  });

  server.post('/api/getExpensesStarting/:date', function(req, res) {
    var date = moment(req.params.date);
    expenses.getExpensesIn({
      start: date,
      end: moment(date).add(14, 'days')
    });
    res.sendStatus(200);
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

  server.get('/api/getExpensesThisPayPeriod', function(req, res) {
    //Redirect to getExpensesStarting with current pay period start date as date
    res.sendStatus(200);
  });

  server.get('/api/getAllExpenses/:recurrence', function(req, res) {
    var recurrence = req.params.recurrence;
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

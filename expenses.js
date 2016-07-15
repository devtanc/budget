/* global module, require */
var logger = require('./logger.js').getLogger;
var Promise = require('bluebird');
var dynamo = require('./dynamo.js');
var moment = require('moment');
var expenseFunctions = require('./expenseFunctions.js');
var format = 'YYYY-MM-DD';

module.exports.getAllExpenses = function(recurrence) {
	if(!recurrence) { return dynamo.queryAll(); }
	return dynamo.queryAll(recurrence);
};

module.exports.getFilteredExpenses = function(paycheck) {
	if(typeof paycheck.start === 'string') {
		paycheck.start = moment(paycheck.start, format);
		paycheck.end = moment(paycheck.end, format);
	}

	return new Promise(function(resolve, reject) {
		dynamo.queryAll().then(function(expenses) {
			var expenseList = expenses.filter(function(expense) {
				if(expense.recurrence === 'system') return false;
				return expenseFunctions[expense.recurrence](expense, paycheck);
			});
			resolve(expenseList);
		}).catch(function(err) {
			logger.error(err);
			reject(err);
		});
	});
};

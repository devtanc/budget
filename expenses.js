/* global module, require, process */
var request = require('request');
var config = require('./config.js');
var logger = require('./logger.js').getLogger;
var Promise = require('promise');
var ready = false;
var expenses = {};
var recurrences = [];
var expenseList = {};

expenses.refreshExpenses = function() {
	var promises = [];
	//Get the list of recurrence types
	promises.push(new Promise(function(resolve, reject) {
		request.get({
			baseUrl: config.couch.baseUrl,
			uri: config.couch.db + '/_design/views/_view/recurrenceTypes?group=true',
			json: true
		}, function(err, response, body) {
			if (err) {
				logger.error(err);
				reject(err);
			} else {
				if(body.error) {
					logger.error(body.error);
					reject(body.error);
				} else {
					resolve(body.rows.map(function(item) {
						return item.key;
					}));
				}
			}
		});
	}));
	//Get the expenses grouped by recurrence
	promises.push(new Promise(function(resolve, reject) {
		request.get({
			baseUrl: config.couch.baseUrl,
			uri: config.couch.db + '/_design/views/_view/recurrence',
			json: true
		}, function(err, response, body) {
			if (err) {
				logger.error(err);
				reject(err);
			} else {
				if(body.error) {
					logger.error(body.error);
					reject(body.error);
				} else {
					var list = {};
					body.rows.forEach(function(element) {
						if(!list[element.key]) { //Group by recurrence (key)
							list[element.key] = [];
						}
						list[element.key].push(element.value);
					});
					resolve(list);
				}
			}
		});
	}));

	return Promise.all(promises);
};

expenses.getRecurrences = function() {
	return recurrences;
};

expenses.getExpenseList = function() {
	return expenseList;
};

expenses.refreshExpenses();
module.exports = expenses;

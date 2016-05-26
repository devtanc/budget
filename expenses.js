/* global module, require, process */
var request = require('request');
var logger = require('./logger.js').getLogger;
var Promise = require('promise');
var ready = false;
var expenses = {};
var recurrences = [];
var expenseList = {};

expenses.refreshExpenses = function() {
  //
};

expenses.getRecurrences = function() {
  return recurrences;
};

expenses.getExpenseList = function() {
  return expenseList;
};

expenses.refreshExpenses();
module.exports = expenses;

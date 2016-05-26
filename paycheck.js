/* global module, require */
var referencePaycheckDate = '2016-01-01';
var format = 'YYYY-MM-DD';
//var request = require('request');
//var logger = require('./logger.js');
var paychecks = require('./paychecks.js');
var moment = require('moment');
var search = require('binary-search');

var paycheck = {};

paycheck.getCurrentPaycheck = function(currentDate) {
  if(/\d{4}-\d{2}-\d{2}/.test(currentDate)){
   return search(paychecks, currentDate, function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });
  } else { throw 'Invalid date format. Must follow "YYYY-MM-DD"'; }
};

var returned = paycheck.getCurrentPaycheck(moment().format('YYYY-MM-DD'));
console.log(paychecks[12], returned);

module.exports = paycheck;

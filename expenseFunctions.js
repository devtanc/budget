/* global module, require*/
var moment = require('moment');
var format = 'YYYY-MM-DD';

module.exports['paycheck'] = function() {
  return true; //Happens every paycheck
};

module.exports['one-off'] = function(expense, paycheck) {
  var dueDate = moment(expense.date);
  console.log(dueDate.format(format), paycheck.start.format(format), paycheck.end.format(format));
  if(dueDate.isBetween(paycheck.start, paycheck.end, null, '[)')) { return true; }
  return false;
};

module.exports['monthly'] = function(expense, paycheck) {
  var compareDate = moment(paycheck.start);
  while(compareDate.isBefore(paycheck.end)) {
    if(compareDate.date() == expense.day_of_month) { return true; }
    compareDate.add(1, 'day');
  }
  return false;
};

module.exports['yearly'] = function(expense, paycheck) {
  var year = moment().year();
  var nextDueDate = moment(year + expense.month + expense.day_of_month, 'YYYYMMMMD');
  console.log(nextDueDate.format(format), paycheck.start.format(format), paycheck.end.format(format));
  if(nextDueDate.isBetween(paycheck.start, paycheck.end, null, '[)')) { return true; }
  return false;
};

module.exports['monthly-on'] = function(expense, paycheck) {
   var monthDay = moment(paycheck.start).date(1);
  var count = 0;
  if(paycheck.start.month() === paycheck.end.month()) {
    var month = paycheck.start.month();
    while(monthDay.month() === month) {
      if(monthDay.format('dddd') === expense.day_of_week) {
        count++;
        if(count == expense.which) {
          if(monthDay.isBetween(paycheck.start, paycheck.end, null, '[)')) { return true; }
          return false;
        }
      }
      monthDay.add(1, 'day');
    }
  } else {
    console.log('NOT SAME MONTH');
    var monthStart = paycheck.start.month();
    var monthEnd = paycheck.end.month();
    while(monthDay.month() === monthStart) {
      console.log(monthDay.format(format), monthStart, monthDay.format('dddd'), count, expense.which);
      if(monthDay.format('dddd') === expense.day_of_week) {
        count++;
        if(count == expense.which) {
          if(monthDay.isBetween(paycheck.start, paycheck.end, null, '[)')) { return true; }
          console.log('NOT THIS ONE!');
          monthDay.add(1, 'month').date(0);
        }
      }
      monthDay.add(1, 'day');
    }
    count = 0;
    while(monthDay.month() === monthEnd) {
      console.log(monthDay.format(format), monthEnd, monthDay.format('dddd'), count, expense.which);
      if(monthDay.format('dddd') === expense.day_of_week) {
        count++;
        if(count == expense.which) {
          if(monthDay.isBetween(paycheck.start, paycheck.end, null, '[)')) { return true; }
          return false;
        }
      }
      monthDay.add(1, 'day');
    }
  }
  return false;
};

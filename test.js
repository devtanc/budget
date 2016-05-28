var moment = require('moment');
var expenseFunctions = require('./expenseFunctions.js');
var date = '20160520';

var x = expenseFunctions['monthly-on']({
  day_of_week: 'Wednesday',
  which: '1'
}, {
  start: moment(date, 'YYYYMMDD'),
  end: moment(date, 'YYYYMMDD').add(14, 'days')
});

console.log(x);

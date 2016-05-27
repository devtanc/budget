/* global module, require */
var paychecks = require('./paychecks.js');
var moment = require('moment');

module.exports.getPaycheck = function(date) {
	if(paychecks.dateFormatRegEx.test(date)){
		var closestPaycheckDate = paychecks.dates.reduce(function(prev, current) {
			if(current > date) { return prev; }
			return current;
		});

		return {
			start: closestPaycheckDate,
			end: moment(closestPaycheckDate).add(14, 'days').format(paychecks.format)
		};
	} else { throw 'Invalid date format. Must follow the format  m"' + paychecks.format + '"'; }
};

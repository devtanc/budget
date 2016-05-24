/* global module, process, require */
var twoWeeksInMS = 1209600000;
var oneDayInMS = 86400000;
var request = require('request');
var logger = require('./logger.js');
var payChecker = {
	isNewPaycheck: false
};

payChecker.checkDate = function() {
	var today = new Date();
	logger.info("Today's day of the month: " + today.getDate());
	request(process.env.DB_BASE_URL + '/regular_payments/_design/views/_view/lastPayPeriod', function(err, res, body) {
		if (!err) {
			logger.debug(body);
			body = JSON.parse(body).rows[0].value;
			var start = new Date(body.lastPayPeriodStart);
			var next = new Date(start.valueOf() + twoWeeksInMS);
			if(today.getDate() == next.getDate()) {
				logger.info("It's a new Pay Period! Time to update!");
				payChecker.isNewPaycheck = true;
				updatePaycheck(next, body);
			} else {
				logger.info("Not a new pay period yet...");
				payChecker.isNewPaycheck = false;
			}
		} else {
			logger.error(err);
		}
	});
};

function updatePaycheck(next, old) {
	var _id = old._id;
	var _rev = old._rev;
	var newObject = {
		lastPayPeriodStart: next.toISOString(),
		lastPayPeriodEnd: new Date(next.valueOf() + twoWeeksInMS - oneDayInMS).toISOString()
	};
	request.put({
		url: process.env.DB_BASE_URL + '/regular_payments/' + _id,
		body: newObject,
		json: true,
		headers: {
			'If-Match': _rev
		}
	}, function(err, response, body) {
		if (err) { logger.error(err); }
		else {
			console.log(body);
		}
	});
}

module.exports = payChecker;

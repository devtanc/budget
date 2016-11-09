/* global process, require */
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var logger = require('./logger.js').getLogger;
var twilio = {};

twilio.sendText = function(to, body) {
	client.messages.create({
		to: to,
		from: process.env.TWILIO_FROM_NUMBER,
		body: body
	}, function(err, message) {
		if (err) { logger.error(err); }
		else { logger.info('Text successful: ' + message.sid); }
	});
};

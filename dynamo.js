/* global require, module, process */
var AWS = require("aws-sdk");
var moment = require('moment');
var q = require('q');

AWS.config.update({
	region: "us-west-2",
	endpoint: process.env.DYNAMO_URL
});

var dynamoLib = {};

var docClient = new AWS.DynamoDB.DocumentClient();
var _table = 'budget-payments';

dynamoLib.buildRangeQueryParams = function(table, type, from, to) {
	return {
		TableName : table,
		ProjectionExpression:"#type, #time, odometer, gallons, #f",
		KeyConditionExpression: "#type = :type and #UID between :date1 and :date2",
		ExpressionAttributeNames:{
			"#type": "recurrance",
			"#UID": 'creationDate'
		},
		ExpressionAttributeValues: {
			":type": type,
			":date1": from,
			":date2": to
		}
	};
};

dynamoLib.queryRange = function(tableName, type, from, to) {
	var deferred = q.defer();
	docClient.query(dynamoLib.buildRangeQueryParams(tableName, type, from, to), function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err, null, 2));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.queryRecent = function(tableName, type) {
	var deferred = q.defer();
	docClient.query({
		TableName: tableName,
		KeyConditionExpression: '#hash = :hkey and #UID > :rkey',
		ExpressionAttributeNames: {
			'#hash': 'recurrance',
			'#UID': 'creationDate'
		},
		ExpressionAttributeValues: {
			':hkey': type,
			':rkey': moment().subtract(2, 'months').toISOString()
		}
	}, function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err, null, 2));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.queryAll = function(tableName, type) {
	var deferred = q.defer();
	var options = { TableName: tableName || _table };
	if(type) {
		options.FilterExpression = 'recurrance = :type';
		options.ExpressionAttributeValues = { ':type': type };
	}
	docClient.scan(options, function(err, data) {
		if (err) {
			deferred.reject("Unable to query. Error:" + JSON.stringify(err));
		} else {
			deferred.resolve(data.Items);
		}
	});
	return deferred.promise;
};

dynamoLib.put = function(params) {
	var deferred = q.defer();
	if(!params.TableName) { params.TableName = _table; }
	docClient.put(params, function(err, data) {
		if (err) {
			deferred.reject("Unable to add item. Error JSON:" + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

dynamoLib.get = function(recurrence, creationDate) {
	var deferred = q.defer();
	docClient.get({
		TableName: _table,
		Key: {
			recurrence: recurrence,
			creationDate: creationDate
		}
	}, function(err, data) {
		if (err) {
			deferred.reject("Unable to get item. Error JSON:" + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

module.exports = dynamoLib;

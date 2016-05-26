/* global require, module, process */
var AWS = require('aws-sdk');
var q = require('q');

AWS.config.update({
	region: 'us-west-2',
	endpoint: process.env.DYNAMO_URL
});

var dynamoLib = {};

var docClient = new AWS.DynamoDB.DocumentClient();
var _table = 'budget-payments';

dynamoLib.queryAll = function(tableName, type) {
	var deferred = q.defer();
	var options = { TableName: tableName || _table };
	if(type) {
		options.FilterExpression = 'recurrance = :type';
		options.ExpressionAttributeValues = { ':type': type };
	}
	docClient.scan(options, function(err, data) {
		if (err) {
			deferred.reject('Unable to query. Error: ' + JSON.stringify(err));
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
			deferred.reject('Unable to add item. Error JSON: ' + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

dynamoLib.get = function(primary, secondary) {
	var deferred = q.defer();
	docClient.get({
		TableName: _table,
		Key: {
			recurrence: primary,
			creationDate: secondary
		}
	}, function(err, data) {
		if (err) {
			deferred.reject('Unable to get item. Error JSON: ' + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

dynamoLib.delete = function(primary, secondary) {
	var deferred = q.defer();
	docClient.delete({
		TableName: _table,
		Key: {
			recurrence: primary,
			creationDate: secondary
		}
	}, function(err, data) {
		if (err) {
			deferred.reject('Error deleting item: ' + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

dynamoLib.update = function(item) {
	var deferred = q.defer();
	docClient.update({
		TableName: _table,
		Key: {
			recurrence: item.recurrence,
			creationDate: item.creationDate
		},
		UpdateExpression: createUpdateExpression(item),
		ExpressionAttributeValues: buildExpressionValues(item),
		ExpressionAttributeNames: buildExpressionNames(item),
		ReturnValues: 'UPDATED_NEW'
	}, function(err, data) {
		if (err) {
			deferred.reject('Error updating item: ' + JSON.stringify(err));
		} else {
			deferred.resolve(data);
		}
	});
	return deferred.promise;
};

function createUpdateExpression(item) {
	var expression = 'SET ';
	Object.keys(item).forEach(function(key, index) {
		if(key === 'recurrence' || key === 'creationDate') { return; }
		expression += '#' + key + ' = :name' + index + ', ';
	});
	return expression.substring(0, expression.length - 2);
}

function buildExpressionValues(item) {
	var values = {};
	Object.keys(item).forEach(function(key, index) {
		if(key === 'recurrence' || key === 'creationDate') { return; }
		values[':name' + index] = item[key];
	});
	return values;
}

function buildExpressionNames(item) {
	var names = {};
	Object.keys(item).forEach(function(key) {
		if(key === 'recurrence' || key === 'creationDate') { return; }
		names['#' + key] = key;
	});
	return names;
}

module.exports = dynamoLib;

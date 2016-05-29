/* global angular, _, moment */
var budgetApp = angular.module('budgetApp');

budgetApp.service('expensesService', [ '$http', '$q', function($http, $q) {
	var service = this;

	this.refreshExpenses = function() {
		return $http.get('/api/getAllExpenses').then(function(res) {
			service.expenses = res.data;
			return service.expenses;
		});
	};

	this.getExpenses = function() {
		if(!service.expenses) { return service.refreshExpenses(); }
		return $q.when(service.expenses);
	};

	this.getFilteredExpenses = function(date) {
		if(!date) {
			return $http.get('/api/getExpensesThisPaycheck').then(function(res) {
				return res.data;
			});
		} else if(/\d{4}-\d{2}-\d{2}/.test(date)) {
			return $http.get('/api/getExpensesStarting/' + date).then(function(res) {
				return res.data;
			});
		} else {
			return $q.reject('Invalid date format. Must follow the format YYYY-MM-DD');
		}
	};

	this.getExpense = function(primary, secondary, recursive) {
		var deferred = $q.defer();
		var expense = _.find(service.expenses, function(expense) {
			return expense.recurrence === primary && expense.creationDate === secondary;
		});

		if (!expense) {
			if(recursive) { deferred.reject('Expense not found in refreshed expense list'); }
			else {
				service.refreshExpenses().then(function() {
					deferred.resolve(service.getExpense(primary, secondary, true));
				});
			}
		} else {
			deferred.resolve(expense);
		}

		return deferred.promise;
	};
}]);

budgetApp.service('schemas', function() {
	var schemas = {};

	this.getSchema = function(schema) {
		return _.cloneDeep(schemas[schema]);
	};

	this.getSchemas = function(schemaArray) {
		var schemaReturn = {};
		schemaArray.forEach(function(schema) {
			schemaReturn[schema] = _.cloneDeep(schemas[schema]);
		});
		return schemaReturn;
	};

	this.getCalculatedFields = function(recurrence) {
		return _.find(schemas.recurrenceTypes, function(type) {
			return type.name === recurrence;
		});
	};

	schemas.globalFields = [
		{
			name:'amount',
			type: 'number',
			step: '0.01',
			value: undefined
		},
		{
			name:'payee',
			type: 'text',
			value: undefined
		},
		{
			name:'purpose',
			type: 'text',
			value: undefined
		}
	];

	schemas.recurrenceTypes = [
		{
			name:'paycheck',
			fields: []
		},
		{
			name:'monthly',
			fields: [
				{
					name:'day_of_month',
					type: 'number',
					step: '1',
					value: undefined
				}
			]
		},
		{
			name:'monthly-on',
			fields: [
				{
					name:'day_of_week',
					options: [
						'Monday',
						'Tuesday',
						'Wednesday',
						'Thursday',
						'Friday',
						'Saturday',
						'Sunday'
					],
					value: undefined
				},
				{
					name:'which',
					type: 'number',
					step: '1',
					value: undefined
				}
			]
		},
		{
			name:'yearly',
			fields: [
				{
					name:'day_of_month',
					type: 'number',
					step: '1',
					value: undefined
				},
				{
					name:'month',
					options: [
						'January',
						'February',
						'March',
						'April',
						'May',
						'June',
						'July',
						'August',
						'September',
						'October',
						'November',
						'December'
					],
					value: undefined
				}
			]
		},
		{
			name:'one-off',
			fields: [
				{
					name:'date',
					type: 'date',
					value: undefined
				},
				{
					name:'paid',
					type: 'checkbox',
					value: false
				}
			]
		}
	];
});

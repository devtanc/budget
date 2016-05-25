/* global angular, _ */
var budgetApp = angular.module('budgetApp');

budgetApp.controller('FrontPageController', ['$scope', '$location', '$http', function($scope, $location, $http) {
	$scope.goTo = function(path) {
		$location.path(path);
	};

	$http.get('/api/getAllExpenses').then(function(res) {
		$scope.expenses = res.data;
	});
}]);

budgetApp.controller('ViewAllPageController', ['$scope', '$location', '$http', function($scope, $location, $http) {
	$scope.goTo = function(path, recurrence, creationDate) {
		if(path === 'edit') {
			$location.path(path + '/' + recurrence + '/' + encodeURIComponent(creationDate));
		} else {
			$location.path(path);
		}
	};

	$http.get('/api/getAllExpenses').then(function(res) {
		$scope.expenses = res.data;
	});
}]);

budgetApp.controller('EditPageController', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http, $routeParams) {
	var recurrence = $routeParams.recurrence;
	var creationDate = $routeParams.creationDate;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	$http.get('/api/getExpense/' + recurrence + '/' + creationDate).then(function(res) {
		$scope.expense = res.data.Item || null;
	}).catch(function(err) {
		console.error(err);
	});
}]);

budgetApp.controller('CreationController', ['$scope', '$location', '$http', function($scope, $location, $http) {
	$scope.recurrence = undefined;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	var monthNumbers = {
		January:0,
		February:1,
		March:2,
		April:3,
		May:4,
		June:5,
		July:6,
		August:7,
		September:8,
		October:9,
		November:10,
		December:11
	};

	var weekdayNumbers = {
		Sunday: 0,
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
	};

	$scope.globalFields = [
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

	$scope.recurrenceTypes = [
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
					name:'numerical_day_of_week',
					hidden: true,
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
				},
				{
					name:'numerical_month',
					hidden: true,
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

	$scope.updateFields = function(recurrence) {
		$scope.calculatedFields = _.find($scope.recurrenceTypes, function(type) {
			return type.name === recurrence;
		});
	};

	$scope.saveExpense = function() {
		var finalObj = {
			recurrence: $scope.recurrence,
			creationDate: new Date().toISOString()
		};
		$scope.globalFields.forEach(function(field) {
			finalObj[field.name] = field.value;
		});
		$scope.calculatedFields.fields.forEach(function(field) {
			var numerical;
			if(field.name === 'day_of_week') {
				numerical = _.find($scope.calculatedFields.fields, function(field) {
					return field.name === 'numerical_day_of_week';
				});
				numerical.value = weekdayNumbers[field.value];
			} else if(field.name === 'month') {
				numerical = _.find($scope.calculatedFields.fields, function(field) {
					return field.name === 'numerical_month';
				});
				numerical.value = monthNumbers[field.value];
			}
			finalObj[field.name] = field.value;
		});

		$http({
			method: 'POST',
			url: '/api/createExpense',
			headers: {
				'Content-Type': 'application/json'
			},
			data: finalObj
		}).then(function() {
			$scope.goTo('/');
		}).catch(function(err) {
			console.error(err);
		});
	};
}]);

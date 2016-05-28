/* global angular, _, moment */
var budgetApp = angular.module('budgetApp');

budgetApp.controller('FrontPageController', ['$scope', '$location', 'expensesService', function($scope, $location, expensesService) {
	$scope.goTo = function(path) {
		$location.path(path);
	};

	expensesService.refreshExpenses().then(function() {
		expensesService.getFilteredExpenses().then(function(expenses) {
			$scope.expenses = expenses;
			console.log(expenses);
		});
	});

	$scope.updatePaycheck = function() {
		var formattedDate = moment($scope.paycheckDate).format('YYYY-MM-DD');
		expensesService.getFilteredExpenses(formattedDate).then(function(expenses) {
			$scope.expenses = expenses;
		});
	};
}]);

budgetApp.controller('ViewAllPageController', ['$scope', '$location', 'expensesService', function($scope, $location, expensesService) {
	$scope.goTo = function(path, recurrence, creationDate) {
		if(path === 'edit') {
			$location.path(path + '/' + recurrence + '/' + encodeURIComponent(creationDate));
		} else {
			$location.path(path);
		}
	};

	expensesService.getExpenses().then(function(expenses) {
		$scope.expenses = expenses;
	});
}]);

budgetApp.controller('EditPageController', ['$scope', '$location', '$http', '$routeParams', 'expensesService', function($scope, $location, $http, $routeParams, expensesService) {
	var recurrence = $routeParams.recurrence;
	var creationDate = $routeParams.creationDate;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	expensesService.getExpense(recurrence, decodeURIComponent(creationDate)).then(function(expense) {
		$scope.expense = expense || null;
	}).catch(function(err) {
		console.error(err);
	});

	$scope.deleteExpense = function() {
		$http({
			method: 'DELETE',
			url: '/api/deleteExpense',
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				primary: recurrence,
				secondary: decodeURIComponent(creationDate)
			}
		}).then(function() {
			expensesService.refreshExpenses().then(function() {
				$scope.goTo('/viewAll');
			});
		}).catch(function(err) {
			console.error(err);
		});
	};

	$scope.updateExpense = function() {
		$http({
			method: 'POST',
			url: '/api/updateExpense',
			headers: {
				'Content-Type': 'application/json'
			},
			data: $scope.expense
		}).then(function() {
			expensesService.refreshExpenses().then(function() {
				$scope.goTo('/viewAll');
			});
		}).catch(function(err) {
			console.error(err);
		});
	};
}]);

budgetApp.controller('CreationController', ['$scope', '$location', '$http', 'schemas', function($scope, $location, $http, schemas) {
	$scope.recurrence = undefined;
	var monthNumbers = schemas.getSchema('monthNumbers');
	var weekdayNumbers = schemas.getSchema('weekdayNumbers');
	$scope.globalFields = schemas.getSchema('globalFields');
	$scope.recurrenceTypes = schemas.getSchema('recurrenceTypes');

	$scope.goTo = function(path) {
		$location.path(path);
	};

	$scope.updateFields = function(recurrence) {
		$scope.calculatedFields = schemas.getCalculatedFields(recurrence);
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

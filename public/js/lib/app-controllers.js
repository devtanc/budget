/* global angular, _, moment */
var budgetApp = angular.module('budgetApp');

budgetApp.controller('FrontPageController', ['$scope', '$location', '$http', 'expensesService', function($scope, $location, http, expensesService) {
	$scope.goTo = function(path) {
		$location.path(path);
	};

	expensesService.refreshExpenses().then(function() {
		expensesService.getFilteredExpenses().then(function(expenseData) {
			$scope.expenses = expenseData.expenses;
			$scope.paycheckStart = new Date(expenseData.paycheckStart);
			$scope.paycheckEnd = new Date(expenseData.paycheckEnd);
			$http.get('/api/getExpense/system/paycheck-actuals').then(function(res) {
				$scope.remainingPay = res.data.Item.leftoverAmt;
				$scope.netPay = res.data.Item.paycheckAmt;
				$scope.recalculateTotal();
			});
		});
	});

	$scope.updatePaycheck = function() {
		var formattedDate = moment($scope.paycheckStart).format('YYYY-MM-DD');
		expensesService.getFilteredExpenses(formattedDate).then(function(expenseData) {
			$scope.expenses = expenseData.expenses;
			$scope.paycheckStart = expenseData.paycheckStart;
			$scope.paycheckEnd = expenseData.paycheckEnd;
			$scope.recalculateTotal();
		});
	};

	$scope.recalculateTotal = function() {
		$scope.total = $scope.expenses.reduce(function(prev, current) {
			return prev + parseFloat(current.amount);
		}, parseFloat($scope.expenses[0].amount));
		$scope.total -= $scope.remainingPay;
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

budgetApp.controller('EditPageController', ['$scope', '$location', '$http', '$routeParams', 'expensesService', 'schemas', function($scope, $location, $http, $routeParams, expensesService, schemas) {
	var recurrence = $routeParams.recurrence;
	var creationDate = $routeParams.creationDate;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	$scope.globalFields = schemas.getSchema('globalFields');
	$scope.recurrenceTypes = schemas.getSchema('recurrenceTypes');
	$scope.calculatedFields = schemas.getCalculatedFields(recurrence);

	expensesService.getExpense(recurrence, decodeURIComponent(creationDate)).then(function(expense) {
		$scope.expense = expense || null;
	}).catch(function(err) {
		console.error(err);
	});

	$scope.updateFields = function() {
		$scope.calculatedFields = schemas.getCalculatedFields($scope.expense.recurrence);
	};

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
		if(recurrence !== $scope.expense.recurrence) {
			var finalObj = {
				recurrence: $scope.expense.recurrence,
				creationDate: creationDate
			};
			$scope.globalFields.forEach(function(field) {
				finalObj[field.name] = $scope.expense[field.name];
			});
			$scope.calculatedFields.fields.forEach(function(field) {
				finalObj[field.name] = $scope.expense[field.name];
			});
			$http({
				method: 'POST',
				url: '/api/createExpense',
				headers: {
					'Content-Type': 'application/json'
				},
				data: finalObj
			}).then(function() {
				$scope.deleteExpense();
			}).catch(function(err) {
				console.error(err);
			});
		} else {
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
		}
	};
}]);

budgetApp.controller('CreationController', ['$scope', '$location', '$http', 'schemas', function($scope, $location, $http, schemas) {
	$scope.recurrence = undefined;
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

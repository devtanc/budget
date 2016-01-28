/* global angular */
var budgetApp = angular.module('budgetApp');

budgetApp.controller('FrontPageController', ['$scope', '$location', 'couchReq', function($scope, $location, couchReq) {
	var twoWeeksInMS = 1209600000;
	var oneDayInMS = 86400000;
	var expenseList = {};
	$scope.expenses = [];
	$scope.netPay = 950.03;
	$scope.total = 0;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	couchReq.get({view:'recurrence'}).then(function(res) {
		res.map(function (element) {
			if(!expenseList[element.key]) {
				expenseList[element.key] = [];
			}
			expenseList[element.key].push(element.value);
		});

		couchReq.get({view:'lastPayPeriod'}).then(function(res) {
			console.log(res);
			if(res.length) {
				res = res[0].value;
				$scope.storedPayPeriod = res;
				$scope.paycheckDate = new Date($scope.storedPayPeriod.lastPayPeriodStart);
				$scope.calculate();
			}
		});
	});

	$scope.calculate = function() {
		$scope.expenses = [];
		$scope.total = 0;
		var payPeriodStart = new Date($scope.paycheckDate);
		var payPeriodEnd = new Date(payPeriodStart.valueOf() + twoWeeksInMS - oneDayInMS);
		var sameMonth = payPeriodStart.getMonth() === payPeriodEnd.getMonth() ? true : false;

		if (!$scope.storedPayPeriod) {
			$scope.storedPayPeriod = {};
			$scope.storedPayPeriod.lastPayPeriodEnd = payPeriodEnd.toISOString();
			$scope.storedPayPeriod.lastPayPeriodStart = payPeriodStart.toISOString();
			couchReq.add({
				lastPayPeriodStart: $scope.storedPayPeriod.lastPayPeriodStart,
				lastPayPeriodEnd: $scope.storedPayPeriod.lastPayPeriodEnd
			}).then(function(res) {
				console.log(res);
				$scope.storedPayPeriod._id = res.id;
				$scope.storedPayPeriod._rev = res.rev;
			});
		}

		if (expenseList.hasOwnProperty('paycheck')) {
			expenseList.paycheck.forEach(function(expense) {
				expense.day_of_month = payPeriodStart.getDate();
				if(expense.purpose == 'Allowance') {
					expense.day_of_month = new Date(payPeriodStart.getFullYear(), payPeriodStart.getMonth(), payPeriodStart.getDate() + 4).getDate();
				}
				$scope.expenses.push(expense);
			});
		}

		if (expenseList.hasOwnProperty('monthly')) {
			expenseList.monthly.forEach(function(expense) {
				if (checkDayOfMonth(sameMonth, expense.day_of_month, payPeriodStart, payPeriodEnd)) {
					$scope.expenses.push(expense);
				}
			});
		}

		if (expenseList.hasOwnProperty('monthly-on')) {
			expenseList['monthly-on'].forEach(function(expense) {
				var count = 0;
				for (var i = 1; i <= payPeriodStart.getDays(); i++) {
					var date = new Date(payPeriodStart.getFullYear(), payPeriodStart.getMonth(), i);
					if (date.getDay() == expense.numerical_day_of_week) {
						count++;
						if (count == expense.which) {
							if (checkDayOfMonth(sameMonth, date.getDate(), payPeriodStart, payPeriodEnd, expense.numerical_day_of_week)) {
								expense.day_of_month = date.getDate();
								$scope.expenses.push(expense);
								return;
							}
						}
					}
				}
				if (!sameMonth) {
					var count = 0;
					for (var i = 1; i <= payPeriodEnd.getDays(); i++) {
						var date = new Date(payPeriodEnd.getFullYear(), payPeriodEnd.getMonth(), i);
						if (date.getDay() == expense.numerical_day_of_week) {
							count++;
							if (count == expense.which) {
								if (checkDayOfMonth(sameMonth, date.getDate(), payPeriodStart, payPeriodEnd, expense.numerical_day_of_week)) {
									expense.day_of_month = date.getDate();
									$scope.expenses.push(expense);
									return;
								}
							}
						}
					}
				}
			});
		}

		if (expenseList.hasOwnProperty('yearly')) {
			expenseList.yearly.forEach(function(expense) {
				if(payPeriodStart.getMonth() === expense.numerical_month ||
					 payPeriodEnd.getMonth() === expense.numerical_month) {
					if(checkDayOfMonth(sameMonth, expense.day_of_month, payPeriodStart, payPeriodEnd)) {
						$scope.expenses.push(expense);
					}
				}
			});
		}

		if (expenseList.hasOwnProperty('one-off')) {
			expenseList['one-off'].forEach(function(expense) {
				var expenseDate = new Date(expense.date);
				if(payPeriodStart.valueOf() < expenseDate.valueOf() &&
					expenseDate.valueOf() < payPeriodEnd.valueOf()) {
						expense.day_of_month = expenseDate.getDate();
						$scope.expenses.push(expense);
				}
			});
		}

		$scope.expenses.forEach(function(expense) {
			$scope.total += expense.amount;
		});
	};

	function checkDayOfMonth(sameMonth, day, payPeriodStart, payPeriodEnd, dayOfWeek) {
		if(sameMonth) {
			if(day > payPeriodStart.getDate() &&
				 day < payPeriodEnd.getDate()) {
				return true;
			}
		} else {
			if (typeof dayOfWeek === 'undefined') {
				if ((day > payPeriodStart.getDate() &&
						 day < payPeriodStart.getDays()) ||
						 day < payPeriodEnd.getDate()) {
					return true;
				}
			} else {
				var startDayOfWeek = new Date(payPeriodStart.getFullYear(), payPeriodStart.getMonth(), day).getDay();
				var endDayOfWeek = new Date(payPeriodEnd.getFullYear(), payPeriodEnd.getMonth(), day).getDay();
				if ((day > payPeriodStart.getDate() &&
						 day < payPeriodStart.getDays() &&
						 dayOfWeek == startDayOfWeek) ||
						 day < payPeriodEnd.getDate() &&
						 dayOfWeek == endDayOfWeek) {
					return true;
				}
			}
		}
		return false;
	}
}]);

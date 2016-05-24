/* global angular */
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
	$scope.goTo = function(path, recurrence, createdDate) {
		if(path === 'edit') {
			$location.path(path + '/' + recurrence + '/' + encodeURIComponent(createdDate));
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
	var createdDate = $routeParams.createdDate;

	$scope.goTo = function(path) {
		$location.path(path);
	};

	$http.get('/api/getExpense/' + recurrence + '/' + createdDate).then(function(res) {
		$scope.expense = res.data.Item || null;
	}).catch(function(err) {
		console.error(err);
	});
}]);

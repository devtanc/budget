/* global angular */
angular.module('budgetApp', ['ngRoute'])
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: '/temps/frontPage.temp.html',
		controller: 'FrontPageController'
	});
});

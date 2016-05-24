/* global angular */
angular.module('budgetApp', ['ngRoute'])
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: '/temps/frontPage.temp.html',
		controller: 'FrontPageController'
	}).when('/viewAll', {
		templateUrl: '/temps/all.temp.html',
		controller: 'ViewAllPageController'
	}).when('/edit/:recurrence/:createdDate', {
		templateUrl: '/temps/edit.temp.html',
		controller: 'EditPageController'
	});
});

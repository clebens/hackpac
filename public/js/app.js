'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'myApp.filters', 
	'myApp.services', 
	'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/', {templateUrl: 'partials/home.html', controller: HomeCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

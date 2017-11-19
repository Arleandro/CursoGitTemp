'use strict';

angular.module('App')
	.service('MapsService', MapsService);

MapsService.$inject = ['$http', '$rootScope'];

function MapsService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.fromCEPorAddress = function(addr) {
		app.showLoad();
		return $http.get("https://maps.google.com/maps/api/geocode/json?address=" + addr);
	}
}

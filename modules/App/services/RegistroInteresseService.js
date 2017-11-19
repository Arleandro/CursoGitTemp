'use strict';

angular.module('App')
	.service('RegistroInteresseService', RegistroInteresseService);

RegistroInteresseService.$inject = ['$http', '$rootScope'];

function RegistroInteresseService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.getComprador = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/interesse/unidade/comprador'));
	}

	self.getVendedor = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/interesse/unidade/vendedor'));
	}

	self.post = function (interesse) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/interesse/unidade'), interesse);
	}

	self.patch = function (interesse) {
		app.showLoad();
		return $http.patch(window.API_ROUTE('/interesse/unidade'), interesse);
	}

}

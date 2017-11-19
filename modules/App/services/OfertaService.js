'use strict';

angular.module('App')
	.service('OfertaService', OfertaService);

OfertaService.$inject = ['$http', '$rootScope'];

function OfertaService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.getVendedor = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/oferta/unidade/vendedor'));
	};

	self.getComprador = function (codUnidade) {
		app.showLoad();
		var query = {codUnidade: codUnidade};
		return $http.get(window.API_ROUTE('/oferta/unidade/comprador?') + $.param(query));
	};

	self.post = function (oferta) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/oferta/unidade'), oferta);
	};

	self.patch = function (oferta) {
		app.showLoad();
		return $http.patch(window.API_ROUTE('/oferta/unidade'), oferta);
	};

}

'use strict';

angular.module('App')
	.service('TipoComodidadeService', TipoComodidadeService);

TipoComodidadeService.$inject = ['$http', '$rootScope'];

function TipoComodidadeService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.lista = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/tipoComodidade'));
	}
}

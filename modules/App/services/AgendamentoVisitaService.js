'use strict';

angular.module('App')
	.service('AgendamentoVisitaService', AgendamentoVisitaService);

AgendamentoVisitaService.$inject = ['$http', '$rootScope'];

function AgendamentoVisitaService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.getComprador = function (codAnuncio) {
		app.showLoad();
		var query = {codAnuncio: codAnuncio};
		return $http.get(window.API_ROUTE('/agendamento/visita/comprador?') + $.param(query));
	};

	self.getVendedor = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/agendamento/visita/vendedor'));
	};

	self.postComprador = function (agendamento) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/agendamento/visita'), agendamento);
	};

	self.postVendedor = function (agendamento) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/agendamento/visita/vendedor'), agendamento);
	};

	self.patch = function (agendamento) {
		app.showLoad();
		return $http.patch(window.API_ROUTE('/agendamento/visita'), agendamento);
	};

}

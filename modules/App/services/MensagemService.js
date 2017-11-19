'use strict';
angular.module('App')
		.service('MensagemService', MensagemService);


MensagemService.$inject = ['$http', '$rootScope'];

function MensagemService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.getVendedor = function() {
		app.showLoad();
		return $http.get(window.API_ROUTE('/mensagem/vendedor'));
	};

	self.getComprador = function(codAnuncio) {
		app.showLoad();
		var query = {codAnuncio:codAnuncio};
		return $http.get(window.API_ROUTE('/mensagem/comprador?') + $.param(query));
	};

	self.getCanal = function(codAnuncio, codCanal) {
		app.showLoad();
		var query = {codAnuncio:codAnuncio, codCanal:codCanal};
		return $http.get(window.API_ROUTE('/mensagem/canal?') + $.param(query));
	};

	self.post = function(mensagem) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/mensagem'), mensagem);
	};

}

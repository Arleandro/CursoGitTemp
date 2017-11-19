'use strict';

angular.module('App')
	.service('FavoritoService', FavoritoService);

FavoritoService.$inject = ['$http', '$rootScope'];

function FavoritoService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.post = function (codUnidade) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/favorito/unidade'), {"codUnidade": codUnidade});
	};

	self.delete = function (codUnidade) {
		app.showLoad();
		return $http.delete(window.API_ROUTE('/favorito/unidade'), {"params": {"codUnidade": codUnidade}});
	};

}

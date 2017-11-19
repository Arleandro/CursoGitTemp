'use strict';

angular.module('App')
	.service('AppService', AppService);

AppService.$inject = ['$http', '$rootScope', 'UsuarioService'];

function AppService($http, $rootScope, UsuarioService) {
	var self = this;
	var app = $rootScope.functions;

	self.versao = function () {
		return $http.get(window.API_ROUTE('/versao'));
	};

	self.login = function () {
		var state = "?state=" + encodeURIComponent(window.location.href);
		return $http.get(window.API_ROUTE('/login') + state);
	};
}
 
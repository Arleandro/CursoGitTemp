'use strict';
angular.module('App')
		.service('NotificacaoService', NotificacaoService);


NotificacaoService.$inject = ['$http', '$rootScope'];

function NotificacaoService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;
	//armazena as notificações não lidas do usuário
	self.listaNotificacoes = [];

	//evento 'NOVA_NOTIFICACAO' receberá as notificações do socket
	$rootScope.$on('NOVA_NOTIFICACAO', function(evt, data) {
		self.listaNotificacoes.push(data);
		$rootScope.$apply(self.listaNotificacoes);
	});

	self.getNotificacoes = function() {
		return $http.get(window.API_ROUTE('/notificacao'));	
	}

}

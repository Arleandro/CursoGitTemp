'use strict';

angular.module('App')
	.service('SocketService', SocketService);

	SocketService.$inject = ['$http', '$rootScope', 'AuthJwtStorage'];

function SocketService($http, $rootScope, AuthJwtStorage) {
	var that = this;
	that.socket = null;

	that.socketUrl = function () {
		return $http.get(window.API_ROUTE('/socket-url'));
	};

	that.connect = function() {
		that.socketUrl()
		.then(function (url) {
			$rootScope.socketUrl = url.data;
			that.socket = io.connect($rootScope.socketUrl + '?token=' + AuthJwtStorage.getToken());
			
			that.socket.on('notificacao', function(data) {
				$rootScope.functions.showMessage(data.txtMensagem);
				$rootScope.$broadcast("NOVA_NOTIFICACAO", data);
			});
			
			that.socket.on('mensagem', function(data) {
				$rootScope.$broadcast("NOVA_MENSAGEM", data);
			});

			that.socket.on('agendamentoVisita', function(data) {
				$rootScope.$broadcast("NOVO_AGENDAMENTO", data);
			});

			that.socket.on('connected', function(data) {
				console.log(data);
			});
		});
	};
	
	that.disconnect = function() {
		that.socket.disconnect();
	};
}

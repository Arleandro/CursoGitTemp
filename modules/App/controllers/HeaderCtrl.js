angular.module('App')
.controller('HeaderCtrl', HeaderCtrl);

HeaderCtrl.$inject = ['$scope', '$state', '$rootScope', 'AppService', 'UsuarioService', 'NotificacaoService', 'SocketService'];

function HeaderCtrl($scope, $state, $rootScope, AppService, UsuarioService, NotificacaoService, SocketService, undefined) {
var self = this;
var app = $scope.functions;
self.usuario = null;
self.notificacaoService = NotificacaoService;

self.init = function() {
	self.usuario = $scope.user;
};

self.logout = function() {
	UsuarioService.logout();
	self.usuario = null;
	self.notificacaoService.listaNotificacoes = [];
	SocketService.disconnect();
};

$rootScope.$on('auth.login', function () {
	self.usuario = $scope.user;
});

$scope.$on('LIMPAR_NOTIFICACAO', function(evt) {
	setTimeout(function() {
		self.notificacaoService.listaNotificacoes = [];
		$scope.$apply(self.notificacaoService);
	}, 1000);
});

}

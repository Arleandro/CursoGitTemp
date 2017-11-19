angular.module('App')
	.directive('loginCancelar', LoginCancelar)
	.directive('loginPessoaJuridica', LoginPessoaJuridica)
	.directive('loginPessoaFisica', LoginPessoaFisica)
	.controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope', '$rootScope', '$state', 'UsuarioService'];

function LoginCtrl($scope, $rootScope, $state, UsuarioService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	self.loginObj = {
		chave: null,
		agencia: null,
		conta: null,
		senha: null
	};

	self.init = function()
	{
		app.init();
		//
		self.isLogged();
	};

	self.doLoginPJ = function()
	{
		UsuarioService.login(null, null, self.loginObj.chave, self.loginObj.senha)
			.then(function (data) {
				$rootScope.$broadcast('auth.login');
			}).catch(function (cause) {
				var message = 'Dados de login incorretos.';
				if (cause != undefined && cause.data != undefined && cause.data.message != undefined) {
					message = cause.data.message;
				}
				app.showMessage(message, 'red darken-3');
				self.loginObj.senha = null;
			});
	};

	self.doLoginPF = function()
	{
		UsuarioService.login(self.loginObj.agencia, self.loginObj.conta, null, self.loginObj.senha)
			.then(function (data) {
				$rootScope.$broadcast('auth.login');
			}).catch(function (cause) {
				var message = 'Dados de login incorretos.';
				if (cause != undefined && cause.data != undefined && cause.data.message != undefined) {
					message = cause.data.message;
				}
				app.showMessage(message, 'red darken-3');
				self.loginObj.senha = null;
			});
	};

	$rootScope.$on('auth.login', function () {
		self.isLogged();
	});

	self.isLogged = function()
	{
		self.usuario = $scope.user;
		if (self.usuario != undefined) {
			$state.go('html.home');
		}
	};

}

LoginCancelar.$inject = [];
function LoginCancelar() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.click(function(){
				$('#loginPJ,#loginPF').hide(200,function(){
					$('#loginChoose').slideDown(200);
					$('[type="password"]').val(null);
				});
			});
		}
	}
}

LoginPessoaFisica.$inject = [];
function LoginPessoaFisica() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.click(function(){
				$('#loginChoose,#loginPJ').hide(200,function(){
					$('#loginPF').slideDown(200);
					$('[type="password"]').val(null);
				});
			});
		}
	}
}

LoginPessoaJuridica.$inject = [];
function LoginPessoaJuridica() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.click(function(){
				$('#loginChoose,#loginPF').hide(200,function(){
					$('#loginPJ').slideDown(200);
					$('[type="password"]').val(null);
				});
			});
		}
	}
}

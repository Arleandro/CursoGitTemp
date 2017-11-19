'use strict';
angular.module('App')
		.service('UsuarioService', UsuarioService);


UsuarioService.$inject = ['$q', '$http', '$rootScope', '$state', 'AuthJwtStorage', 'SocketService', 'NotificacaoService'];

function UsuarioService($q, $http, $rootScope, $state, AuthJwtStorage, SocketService, NotificacaoService) {
	var that = this;

	that.estaAutenticado = function () {
		return AuthJwtStorage.isAuthenticated();
	};

	that.obterUsuario = function () {
		SocketService.connect();
		return AuthJwtStorage.getUser();
	};

	that.obterUsuarioNutela = function () {
		return that.obterUsuarioRaiz();
	};

	that.obterUsuarioRaiz = function () {
		var defered = $q.defer();

		defered.resolve($rootScope.user);

		return defered.promise;
	};

	that.validarLogin = function () {
	var qp = null;

	if(window.location.hash) {
		qp = location.hash.substring(1);
	} else {
		qp = location.search.substring(1);
	}

	var parseqp = qp ? JSON.parse('{"' + qp.replace(/^.*?\?/, "").replace(/&/g, '","').replace(/=/g,'":"') + '"}',
		function(key, value) {
		return key=== "" ? value : decodeURIComponent(value);
		}
	) : {};

	var defered = $q.defer();

	$http.post(window.API_ROUTE('/auth/validarlogin'),
		parseqp
	).success(function (jwt) {
			AuthJwtStorage.registrarToken(jwt);
		$rootScope.user = that.obterUsuario();
		defered.resolve($rootScope.user);
		}).error(function (data, status) {
			defered.reject({data: data, status: status});
		});

		return defered.promise;
	};

	that.login = function(dependencia, conta, chave, senha) {
		var defered = $q.defer();
		$http.post(window.API_ROUTE('/auth/login'),{
			dependencia: dependencia,
			conta: conta,
			chave: chave,
			senha: senha
		}).success(function (jwt) {
			AuthJwtStorage.registrarToken(jwt);
			$rootScope.user = that.obterUsuario();
			defered.resolve($rootScope.user);
			$rootScope.$broadcast('auth.login');
			SocketService.connect();
			consultarNotificacoes($rootScope);
		}).error(function (data, status) {
			defered.reject({data: data, status: status});
		});

		return defered.promise;
	};

	that.logout = function () {
		AuthJwtStorage.clearToken();
		$rootScope.user = null;
		$rootScope.$broadcast('auth.logout');
	};


	function consultarNotificacoes($rootScope) {
		NotificacaoService.getNotificacoes()
		.success(function(data) {
			NotificacaoService.listaNotificacoes = data;
			setTimeout(function() {
			$rootScope.$apply(NotificacaoService.listaNotificacoes);
			}, 100);
		}).error(function(err) {
			console.log("Erro ao carregar as notificações");
		});
	}


//	// Sempre que fizer login, processa as permissões de acesso
//	$rootScope.$on('auth.login', function () {
//		processarPermissoes();
//	});
//	//processarPermissoes();


	/**
	 * Obtém as permissões do usuário logado
	 *
	 * @returns {undefined}
	 */
	function processarPermissoes() {
		that.obterUsuario().then(function (usuario) {
			if (!usuario.roles) {
				usuario.roles = [window.RBAC.ROLE.GUEST];
			}

			// Encaminha para a tela inicial de acordo com o perfil

			/**
			 *
			 * @returns {undefined}
			 */
			if (!usuario.roles || usuario.roles.length === 0) {
				// Usuário nao possui permissoes
				// @TODO: Exibir mensagem e fazer logout
			}

			for (var a = 0, l = usuario.roles.length; a < l; a++) {
				var role = usuario.roles[a];
				switch (role) {
//					case window.RBAC.ROLE.RESPONSAVEL_RH:
//						$state.go('private.cliente.listaAgendamento');
//						return;
					default:
						// Usuário nao possui permissoes
						// @TODO: Exibir mensagem e fazer logout
						break;
				}
			}

		});
	}
}

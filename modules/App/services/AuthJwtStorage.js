'use strict';
angular.module('App')
	  .service('AuthJwtStorage', AuthJwtStorage);

AuthJwtStorage.$inject = ['$q', '$window'];

function AuthJwtStorage($q, $window) {
	 var that = this;
	 var user = null;
	 var token = $window.localStorage['jwt'];

	 that.clearToken = function () {
		  user = null;
		  token = null;
		  $window.localStorage.removeItem('jwt');
	 };

	 that.registrarToken = function(newToken) {
		  $window.localStorage['jwt'] = newToken;
		  token = newToken;
		  user = null;
		  that.isAuthenticated();
	 };

	 that.getToken = function () {
		  return token;
	 };

	 that.isAuthenticated = function () {
		  if (user) {
				return true;
		  }

		  if (token) {
				var json = parseJwt(token);
				if (json.exp && !(Math.round(new Date().getTime() / 1000) <= json.exp)) {
					 // Token expirado
					 return false;
				}

				// Cria as informações do usuário apartir do token
				user = {
					 codigoClienteid: parseInt(json.sub),
					 username: json.nome,
					 nome: json.nome,
					 cpfCNPJ: json.cpfCNPJ,
					 jwt: json,
					 jwt_token: token,
					 roles: [window.RBAC.ROLE.GUEST]
				};

				if (json.roles) {
					 user.roles = json.roles.map(function (role) {
						  if (window.RBAC.ROLE.hasOwnProperty(role)) {
								return window.RBAC.ROLE[role];
						  }
						  return window.RBAC.ROLE.GUEST;
					 });
				}
				return true;
		  } else {
				return false;
		  }
	 };

	 that.getUser = function () {
	if (that.isAuthenticated()) {
		 return user;
	}

	return null;
	 };

	 function parseJwt(token) {
		  var base64Url = token.split('.')[1];
		  var base64 = base64Url.replace('-', '+').replace('_', '/');
		  return JSON.parse($window.atob(base64));
	 }
}

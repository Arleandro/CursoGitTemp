'use strict';

angular
	.module('App')
	.config(AppConfig);

AppConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

function AppConfig($stateProvider, $urlRouterProvider) {

	//Default State
	$urlRouterProvider.otherwise('/bem-vindo');

	$stateProvider
		// -- Html
		.state('html', {
			abstract: true,
			templateUrl: urlTemplate('Html', 'App')
		})
		// -- Home Boas Vindas
		.state('html.bemVindo', {
			url: '/bem-vindo',
			templateUrl: urlTemplate('BemVindo', 'App')
		})
		// -- Home
		.state('html.home', {
			url: '/home',
			templateUrl: urlTemplate('Home', 'App')
		})
		// -- Home
		.state('html.login', {
			url: '/login',
			templateUrl: urlTemplate('Login', 'App')
		})
		// -- Lista anuncios do logado
		.state('html.busca', {
			url: '/busca',
			templateUrl: urlTemplate('Anuncios/Busca', 'App')
		})
		// -- Lista anuncios do logado
		.state('html.anuncios', {
			url: '/anuncios',
			templateUrl: urlTemplate('Anuncios/Listagem', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// -- Cadastrar anuncio PF
		.state('html.anunciosCadastrar', {
			url: '/anuncios/cadastrar',
			templateUrl: urlTemplate('Anuncios/FormularioPF', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// Editar anuncio PF
		.state('html.anunciosEditar', {
			url: '/anuncios/editar/{idAnuncio:[0-9]*}',
			templateUrl: urlTemplate('Anuncios/FormularioPF', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// Detalhes do anuncio PF
		.state('html.anunciosDetalhes', {
			url: '/anuncios/detalhes/{idAnuncio:[0-9]*}',
			templateUrl: urlTemplate('Anuncios/DetalhesUnidade', 'App')
		})
		// -- Cadastrar anuncio PJ
		.state('html.empreendimentoCadastrar', {
			url: '/anuncios/empreendimento/cadastrar',
			templateUrl: urlTemplate('Anuncios/FormularioPJ', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// Editar anuncio PJ
		.state('html.notificacoes', {
			url: '/notificacoes',
			templateUrl: urlTemplate('Notificacoes', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// Editar anuncio PJ
		.state('html.empreendimentoEditar', {
			url: '/anuncios/empreendimento/editar/{idAnuncio:[0-9]*}',
			templateUrl: urlTemplate('Anuncios/FormularioPJ', 'App'),
			data: {
				ACCESS_LEVEL: window.RBAC.ACCESS_LEVEL.USUARIO
			}
		})
		// Detalhes do anuncio PJ
		.state('html.empreendimentoDetalhes', {
			url: '/anuncios/empreendimento/detalhes/{idAnuncio:[0-9]*}',
			templateUrl: urlTemplate('Anuncios/DetalhesEmpreendimento', 'App')
		})
		// Detalhes do anuncio PJ
		.state('html.empreendimentoDetalhesUnidade', {
			url: '/anuncios/empreendimento/detalhes/{idAnuncio:[0-9]*}/{idUnidade:[0-9]*}',
			templateUrl: urlTemplate('Anuncios/DetalhesEmpreendimento', 'App')
		})
		// Artigos da Gambiarra
		.state('html.artigos1', {
			url: '/artigo/1',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo1', 'App')
		})
		.state('html.artigos2', {
			url: '/artigo/2',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo2', 'App')
		})
		.state('html.artigos3', {
			url: '/artigo/3',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo3', 'App')
		})
		.state('html.artigos4', {
			url: '/artigo/4',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo4', 'App')
		})
		.state('html.artigos5', {
			url: '/artigo/5',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo5', 'App')
		})
		.state('html.artigos6', {
			url: '/artigo/6',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo6', 'App')
		})
		.state('html.artigos7', {
			url: '/artigo/7',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo7', 'App')
		})
		.state('html.artigos8', {
			url: '/artigo/8',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo8', 'App')
		})
		.state('html.artigos9', {
			url: '/artigo/9',
			templateUrl: urlTemplate('ArtigosDaGambiarra/Artigo9', 'App')
		})
	;
}

/**
 * Faz a resolução para o módulo solicitado
 *
 * @param {type} module
 * @returns {Array}
 */
function resolveModule(module) {
	return [
		'$q', '$ocLazyLoad',
		function ($q, $ocLazyLoad) {
			if (window.__BUNDLED__MODULES__) {
				return $ocLazyLoad.load({
					name: module,
					files: ['modules/' + module + '/' + module + '.bundle.min.js']
				});
			} else {
				var deferred = $q.defer();
				setTimeout(function () {
					$ocLazyLoad.load({
						name: module
					});
					deferred.resolve(true);
				});
				return deferred.promise;
			}
		}
	];
}

/**
 * Facilitador de criação de endereços para templates
 *
 * @param {type} page
 * @param {type} module
 * @returns {String}
 */
function urlTemplate(page, module) {
	return 'modules/' + module + '/templates/' + page + '.html';
}

'use strict';

angular.module('App')
	.service('AnuncioService', AnuncioService);

AnuncioService.$inject = ['$http', '$rootScope'];

function AnuncioService($http, $rootScope) {
	var self = this;
	var app = $rootScope.functions;

	self.filtros = {
		codOrdenacao: 1, //int
		txtLocalizacao: null, //
		nomLogradouro: null,
		nomBairro: null,
		nomCidade: null, //
		quarto: null, //int
		banheiro: null, //int
		garagem: null, //int
		sala: null, //int
		codTipoUnidade: null, //int
		vlrUnidadeInicio: 20000, //int
		vlrUnidadeFim: 2000000, //int
		nomIncorporadora: null, //string
		codEstagioObra: null, //int
		limite: 10,
		pagina: 1
	};

	self.post = function (anuncio) {
		app.showLoad();
		return $http.post(window.API_ROUTE('/anuncio'), anuncio);
	}

	self.getLista = function () {
		app.showLoad();
		return $http.get(window.API_ROUTE('/anuncios'));
	}

	self.getAnuncioPublico = function(idItem) {
		app.showLoad();
		return $http.get(window.API_ROUTE('/anuncio') + "?codAnuncio=" + idItem);
	}

	self.getAnuncio = function (idItem) {
		app.showLoad();
		return $http.get(window.API_ROUTE('/anuncios') + "?codAnuncio=" + idItem);
	}

	self.put = function (anuncio) {
		app.showLoad();
		return $http.put(window.API_ROUTE('/anuncio'), anuncio);
	}

	self.delete = function (idItem) {
		app.showLoad();
		return $http.delete(window.API_ROUTE('/anuncio'), {"params": {"codAnuncio": idItem}});
	}

	self.getUnidades = function (filtros) {
		app.showLoad();
		var query = {};
		if (typeof filtros == 'object')
			for (var i in filtros)
				if (filtros[i] != null) {
					if (typeof filtros[i] == 'object') {
						// objetos especiais
						switch (i) {
							case 'comodidades':
								var arr = [];
								for (var j in filtros[i]) {
									arr.push(filtros[i][j].codTipoComodidade);
								}
								query[i] = arr.join(',');
								break;
							default:
								query[i] = filtros[i].join(',');
						}
					} else {
						query[i] = filtros[i];
					}
				}
		return $http.get(window.API_ROUTE('/unidadeanuncio?' + $.param(query)));
	}

}

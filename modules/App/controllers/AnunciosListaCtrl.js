angular.module('App')
	.controller('AnunciosListaCtrl', AnunciosListaCtrl);

AnunciosListaCtrl.$inject = ['$scope', '$state', '$rootScope', 'AnuncioService'];

function AnunciosListaCtrl($scope, $state, $rootScope, AnuncioService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;
	self.usuario = $scope.user;

	self.caracteristicas = {
		1: {name:'Quartos', class:'bed'},
		2: {name:'Banheiros', class:'bath'},
		3: {name:'Vagas de garagem', class:'park'},
		4: {name:'Salas', class:'room'}
	};

	self.tipos = {
		1: {name:'Casa', class:'home'},
		2: {name:'Apartamento', class:'business'},
		3: {name:'Loja', class:'store'}
	};

	/**
	 * Initializes the form data
	 */
	self.init = function()
	{
		app.init();
		//
		AnuncioService.getLista()
			.success(function (data) {
				self.anuncios = data;
				app.createImagesLista(self.anuncios);
				app.hideLoad();
			})
			.error(function (cause) {
				var message = 'Não foi possível receber a lista de anúncios.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	}
	self.removerItem = function(codAnuncio, codItem)
	{
		if (confirm('Deseja mesmo deletar este anúncio?\nIsso não poderá ser desfeito.')) {
			AnuncioService.delete(codAnuncio)
				.success(function (data) {
					var message = data.message != undefined ? data.message : 'Anuncio deletado.';
					self.anuncios.splice(codItem, 1);
					app.showMessage(message, 'green darken-2');
					app.hideLoad();
				})
				.error(function (cause) {
					var message = 'Não foi possível remover o anúncio.';
					if (cause != undefined && cause.message != undefined) {
						message = cause.message;
					}
					app.showMessage(message , 'red darken-3');
					app.hideLoad();
				});
		}
	}
}

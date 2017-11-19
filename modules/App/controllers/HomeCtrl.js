angular.module('App')
	.controller('HomeCtrl', HomeCtrl);

HomeCtrl.$inject = ['$scope', '$state', 'AnuncioService'];

function HomeCtrl($scope, $state, AnuncioService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	self.filtros = AnuncioService.filtros;

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
	self.quartos = [
		{value: 0, label: '0'},
		{value: 1, label: '1'},
		{value: 2, label: '2'},
		{value: 3, label: '3'},
		{value: 4, label: '4'},
		{value: 5, label: '5+'}
	];
	self.rooms = [
		{value: 1, label: '0'},
		{value: 2, label: '1'},
		{value: 2, label: '2'},
		{value: 3, label: '3'},
		{value: 4, label: '4'},
		{value: 5, label: '5+'}
	];
	self.banheiros = [
		{value: 1, label: '1'},
		{value: 2, label: '2'},
		{value: 3, label: '3'},
		{value: 4, label: '4'},
		{value: 5, label: '5+'}
	];
	self.garagens = [
		{value: 0, label: '0'},
		{value: 1, label: '1'},
		{value: 2, label: '2'},
		{value: 3, label: '3'},
		{value: 4, label: '4'},
		{value: 5, label: '5+'}
	];
	self.estagiosObra = [
		{value: 1, label: 'Pronto'},
		{value: 2, label: 'Em construção'}
	];

	self.unidades = [];
	// artigosdagambiarra
	self.arrCategorias = [
		{
			noCategoria: "Vendendo imóvel",
			posts: [
				{
					dsLink: "#/artigo/1",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo1.png",
					noPost: "post blabl ablablassd ",
				},
				{
					dsLink: "#/artigo/2",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo2.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				},
				{
					dsLink: "#/artigo/3",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo3.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				}
			]
		},
		{
			noCategoria: "Comprando imóvel",
			posts: [
				{
					dsLink: "#/artigo/4",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo4.png",
					noPost: "post blabl ablablassd ",
				},
				{
					dsLink: "#/artigo/5",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo5.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				},
				{
					dsLink: "#/artigo/6",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo6.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				}
			]
		},
		{
			noCategoria: "Investindo em imóvel",
			posts: [
				{
					dsLink: "#/artigo/7",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo7.png",
					noPost: "post blabl ablablassd ",
				},
				{
					dsLink: "#/artigo/8",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo8.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				},
				{
					dsLink: "#/artigo/9",
					dsImagem: self.MEDIA_FOLDER + "img/fke/artigosdagambiarra/artigo9.png",
					noPost: "Dona Hermínia e Carol Sandler: Crédito Imobiliário",
				}
			]
		}
	];

	self.init = function()
	{
		app.init();
		//
		self.initSlider();
		//
		self.doSearch();
	};

	self.updateValue = function()
	{
		var args = arguments;
		$scope.$apply(function() {
			self.filtros.vlrUnidadeInicio = Math.floor(args[2][0]);
			self.filtros.vlrUnidadeFim = Math.floor(args[2][1]);
		});
	};

	self.doSearch = function()
	{
		var filtros = {
			limite: 3,
			pagina: 1
		}
		AnuncioService.getUnidades(filtros)
			.success(function (data) {
				if (data.dados != undefined) {
					if(self.filtros.pagina == 1) {
						self.unidades = data.dados;
					} else {
						for (var i in data.dados) {
							self.unidades.push(data.dados[i]);
						}
					}
				}
				app.createImagesLista(self.unidades);
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
		self.filterClose();
	};

	self.initSlider = function()
	{
		var slider = document.getElementById('price-slider');
		noUiSlider.create(slider, {
			start: [self.filtros.vlrUnidadeInicio, self.filtros.vlrUnidadeFim],
			connect: true,
			step: 1,
			orientation: 'horizontal', // 'horizontal' or 'vertical'
			behaviour: 'tap-drag', // Move handle on tap, bar is draggable
			range: {
				'min': 20000, //20k
				'max': 2000000 //2kk
			},
			step: 10000,
			format: wNumb({
				decimals: 0
			})
		});
		slider.noUiSlider.on('set', self.updateValue);
	};

	self._filterDuring = false;
	self.isFilterOpen = function()
	{
		return $('#search-filter-extra').css('display') == 'block';
	};
	self.filterToggle = function()
	{
		if (! self._filterDuring) {
			self._filterDuring = true;
			$('#search-filter-extra').slideToggle(200, function(){
				self._filterDuring = false;
			});
		}
	};
	self.filterClose = function()
	{
		if (self.isFilterOpen() && ! self._filterDuring) {
			self._filterDuring = true;
			$('#search-filter-extra').slideUp(200, function(){
				self._filterDuring = false;
			});
		}
	};

	self.buscar = function()
	{
		$state.go('html.busca');
	};

/*
	$scope.radioCancel = function(event) {
		if ($scope.checked == event.target.value)
			$scope.checked = false;
	};
*/

}

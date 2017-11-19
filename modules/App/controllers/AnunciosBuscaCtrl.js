angular.module('App')
	.controller('AnunciosBuscaCtrl', AnunciosBuscaCtrl)
	.directive('orderChange', OrderChange);

AnunciosBuscaCtrl.$inject = [
	// angular
	'$scope', '$state', '$window',
	// local
	'AnuncioService', 'TipoComodidadeService', 'MapsService', 'FavoritoService', 'UsuarioService'
];

// ویلیام
function AnunciosBuscaCtrl($scope, $state, $window, AnuncioService, TipoComodidadeService, MapsService, FavoritoService, UsuarioService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	angular.element($window).bind('resize', function(){
		self.mapResize();
	});
	angular.element($window).bind('scroll', function(){
		//self.filterClose();
		self.mapResize();
	});

	// map
	self.mapObj;
	self.filtros = angular.copy(AnuncioService.filtros);
	self.filtros.limite = 10;
	self.filtros.pagina = 1;
	self.pins = [];

	self.vlrMinimo = 20000; //20k
	self.vlrMaximo = 10000000; //2kk
	self.filtros.vlrUnidadeFim = self.vlrMaximo;

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
	self.ordenacoes = [
		{value: 1, label:'Relevância'},
		{value: 2, label:'Menor preço'},
		{value: 3, label:'Maior preço'}//,
	//	{value: 4, label:'Mais populares'},
	//	{value: 5, label:'Favoritos'}
	];
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
		{value: 2, label: 'Em construção'},
		{value: 3, label: 'Lançamento'}
	];
	self.unidades = [];
	self.comodidades = [];

	/**
	 * Initializes the form data
	 */
	self.init = function()
	{
		app.init();
		//
		TipoComodidadeService.lista()
			.success(function (data) {
				self.comodidades = data;
				self.arrComodidades = self._arrComodidades();
				setTimeout(function(){
					$('select').material_select();
					Materialize.updateTextFields();
				},10);
				app.hideLoad();
			})
			.error(function (cause) {
				app.hideLoad();
			});
		self.doSearch();
		self.initSlider();
		self.mapResize();
	};

	self.doSearch = function(pagina)
	{
		self.filtros.pagina = pagina != undefined ? pagina : 1;
		AnuncioService.getUnidades(self.filtros)
			.success(function (data) {
				if (data.dados != undefined) {
					if(self.filtros.pagina == 1) {
						// TODO limpa pins
						// limpa unidades
						self.unidades = [];
					}
					for (var i in data.dados) {
						self.unidades.push(data.dados[i]);
					}
					app.createImagesLista(self.unidades);
					app.hideLoad();

					self.loadMap();
					setTimeout(function(){
						for (var i in self.unidades) {
							var latLng = {
								lat: self.unidades[i].anuncio.enderecoAnuncio.vlrLatitude,
								lng: self.unidades[i].anuncio.enderecoAnuncio.vlrLongitude
							};
							self.pins.push(new google.maps.Marker({
								icon: "modules/App/public/media/img/ico/marker.svg",
								map: self.mapObj,
								position: latLng,
								clickable: true,
								animation: google.maps.Animation.DROP
							}));
							self.unidades[i].pin = self.pins[self.pins.length-1];
							if (self.mapBounds != undefined) {
								self.mapBounds.extend(latLng);
								self.mapObj.fitBounds(self.mapBounds);
							}
							self.mapResize();
						}
					},50);
				}
				if (data.temMaisItens != undefined) {
					self._hasNext = data.temMaisItens;
				}
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
	self.doSearchNext = function()
	{
		if (self._hasNext) {
			self._hasNext = false;
			self.doSearch(++self.filtros.pagina);
		}
	};
	self.clearSearch = function()
	{
		self.filtros = angular.copy(AnuncioService.filtros);
		self.filtros.limite = 10;
		self.filtros.pagina = 1;
		self.filtros.vlrUnidadeFim = self.vlrMaximo;
		setTimeout(function(){
			$('select').material_select();
			Materialize.updateTextFields();
		},10);
		// TODO: how to change noUISlider values?
	};

	self.updateValue = function()
	{
		var args = arguments;
		$scope.$apply(function() {
			self.filtros.vlrUnidadeInicio = Math.floor(args[2][0]);
			self.filtros.vlrUnidadeFim = Math.floor(args[2][1]);
		});
	};

	// TODO não utilizado ainda
	self.hoverUnidade = function(i)
	{
		self.unidades[i].pin.setIcon("modules/App/public/media/img/ico/marker.svg");
		//icon: "modules/App/public/media/img/ico/marker.svg",;
	}

	self.initSlider = function()
	{
		self.slider = document.getElementById('price-slider');
		noUiSlider.create(self.slider, {
			start: [self.filtros.vlrUnidadeInicio, self.filtros.vlrUnidadeFim],
			connect: true,
			step: 1,
			orientation: 'horizontal', // 'horizontal' or 'vertical'
			behaviour: 'tap-drag', // Move handle on tap, bar is draggable
			range: {
				'min': self.vlrMinimo, //20k
				'max': self.vlrMaximo //2kk
			},
			step: 10000,
			format: wNumb({
				decimals: 0
			})
		});
		self.slider.noUiSlider.on('set', self.updateValue);
	};

	self.loadMap = function()
	{
		setTimeout(function(){
			// TODO adicionar pontos
			var mapPosition = {
				lat:-23.192279,
				lng:-47.1679616
			};

			if (typeof google != 'undefined') {
				self.mapObj = new google.maps.Map(document.getElementById('maps'), {
					center: mapPosition,
					zoom: 16,
					panControl: false,
					fullscreenControl: false,
					keyboardShortcuts: false,
					streetViewControl: false
				});
				self.mapBounds = new google.maps.LatLngBounds();
				self.mapResize();
			}
		});
	};

	self.mapResize = function()
	{
		// map visible?
		if ($('.map-block').css('display') == 'block') {
			// top menu H
			var menuH = $('.navbar-fixed').height();
			// search bar H
			var searchH = $('.search-filter-main').height();
			//
			var scrollT = $(window).scrollTop();
			// window H
			var windowH = $(window).height();
			// footer from top
			var footerT = $('footer').offset().top - scrollT;
			var footerH = $('footer').height() - ($('footer').offset().top - scrollT) + windowH;
			var footerOff = windowH - footerT > 0 ? windowH - footerT : 0;
			if ($('.search-filter-block').css('position') == 'fixed') {
				//
				var finalH = windowH - menuH - footerOff - searchH;
				if (finalH < 0)
					finalH = 0;
				$('.map-block').height(finalH);
				$('.map-block').css('top', (menuH + searchH) + "px");
			} else {
				searchH = $('.search-filter-block').height();
				// search bar from top
				var searchOff = searchH - scrollT >= menuH ? searchH + menuH - scrollT : menuH;
				if (scrollT >= $('.search-filter-block').height()) {
				}
				//
				var finalH = windowH - searchOff - footerOff;
				if (finalH < 0)
					finalH = 0;
				$('.map-block').height(finalH);
				$('.map-block').css('top', searchOff + "px");
			}
		}
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
				self.mapResize();
			});
		}
	};
	self.filterClose = function()
	{
		if (self.isFilterOpen() && ! self._filterDuring) {
			self._filterDuring = true;
			$('#search-filter-extra').slideUp(200, function(){
				self._filterDuring = false;
				self.mapResize();
			});
		}
	};

	self.arrComodidades = [];
	self._arrComodidades = function()
	{
		var arr = [];
		if (
			self.anuncio != undefined && self.anuncio.comodidadeAnuncios != undefined && self.anuncio.comodidadeAnuncios.length > 0 &&
			self.comodidades != undefined && self.comodidades.length > 0
		) {
			for (var c in self.anuncio.comodidadeAnuncios) {
				for (var d in self.comodidades) {
					if (self.anuncio.comodidadeAnuncios[c].codTipoComodidade == self.comodidades[d].codTipoComodidade) {
						arr.push(self.comodidades[d].nomTipoComodidade);
						break;
					}
				}
			}
		}
		return arr;
	};
	
	self.favorito = function(unidade) {
		if(unidade) {
			if(!unidade.indFavorito) {
				FavoritoService.post(unidade.codUnidade)
					.success(function (data) {
						unidade.indFavorito = true;
						app.hideLoad();
					})
					.error(function (cause) {
						app.hideLoad();
					});
			} else {
				FavoritoService.delete(unidade.codUnidade)
					.success(function (data) {
						unidade.indFavorito = false;
						app.hideLoad();
					})
					.error(function (cause) {
						app.hideLoad();
					});
			}
		}
	};
	
	self.usuarioLogado = function() {
		return UsuarioService.estaAutenticado();
	};
}

OrderChange.$inject = [];
function OrderChange() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.change(function(){
				$scope.ctrl.doSearch();
			});
		}
	}
}

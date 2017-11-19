angular.module('App')
	.controller('EmpreendimentoCadastroCtrl', EmpreendimentoCadastroCtrl);

EmpreendimentoCadastroCtrl.$inject = [
	// angular
	'$scope', '$state', '$compile', '$stateParams',
	// local
	'AnuncioService', 'TipoComodidadeService', 'MapsService', 'AuthJwtStorage',
	// libs
	'FileUploader'
];

function EmpreendimentoCadastroCtrl($scope, $state, $compile, $stateParams, AnuncioService, TipoComodidadeService, MapsService, AuthJwtStorage, FileUploader, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	self.mapObj;
	self.mapPin;

	// recebeu codigo do anuncio?
	self.codAnuncio = $stateParams.idAnuncio;
	// esta na pagina de emrpeendimento?
	self.editing = $state.current.name == 'html.empreendimentoEditar';

	// no code, nogo
	if (self.editing && (self.codAnuncio == undefined || self.codAnuncio == '' || self.codAnuncio == 0)) {
		$state.go('html.anuncios');
	}

	self.estagiosObra = [
		{value: 1, label: 'Pronto'},
		{value: 2, label: 'Em construção'},
		{value: 3, label: 'Lançamento'}
	];
	self.anuncio = {
		 // fixos
		codTipoVenda: 1,
		indEmpreendimento: "S",
		empreendimentoAnuncio: {codEstagioObra:null},
		unidadeAnuncios: [
			{
				vlrUnidadeDesconto: 0,
				caracteristicaUnidades: [
					//Quarto
					{
						codTipoCaracteristica: 1,
						vlrCaracteristica: null
					},
					//Banheiro
					{
						codTipoCaracteristica: 2,
						vlrCaracteristica: null
					},
					//Garagem
					{
						codTipoCaracteristica: 3,
						vlrCaracteristica: null
					},
					//Room - Sala
					{
						codTipoCaracteristica: 4,
						vlrCaracteristica: null
					}
				]
			}
		],
		// alterar
		codUsuarioPublicacao: 1
	};

	self.comodidades = [];
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
	self.tipos = {
		2: 'Residencial',
		3: 'Comercial'
	};
	// API
	self.url_documento_imagem = window.API_ROUTE('/documento/imagem')
	// api url
	var uploader = $scope.uploader = new FileUploader({
		url: self.url_documento_imagem
	});
	// a sync filter
	uploader.filters.push({
		name: 'syncFilter',
		fn: function(item /*{File|FileLikeObject}*/, options) {
			var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
			return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
		}
	});

	// CALLBACKS
	uploader.onBeforeUploadItem = function(item) {
		item.headers['Authorization'] = 'Bearer ' + AuthJwtStorage.getToken();
	};
	uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
		// TODO adicionar validacao
	};
	uploader.onAfterAddingFile = function(fileItem) {
		uploader.uploadItem(fileItem);
		app.showLoad();
	};
	uploader.onProgressItem = function(fileItem, progress) {
	};
	uploader.onSuccessItem = function(fileItem, response, status, headers) {
		if (response.txtHash != undefined) {
			if (self.anuncio.unidadeAnuncios[fileItem.id] == undefined)
				self.anuncio.unidadeAnuncios[fileItem.id] = {mediaUnidadeAnuncios: {}};
			if (self.anuncio.unidadeAnuncios[fileItem.id].mediaUnidadeAnuncios == undefined)
				self.anuncio.unidadeAnuncios[fileItem.id].mediaUnidadeAnuncios = [];
			var doc = response;
			doc.documento = {"txtHash": doc.txtHash};
			self.anuncio.unidadeAnuncios[fileItem.id].mediaUnidadeAnuncios.push(doc);

			self.mudarFotoCapaAuto(fileItem.id);
			app.createImages(self.anuncio);
		} else {
			// TODO erro no envio da imagem
		}
	};
	uploader.onErrorItem = function(fileItem, response, status, headers) {
	};
	uploader.onCompleteItem = function(fileItem, response, status, headers) {
		app.hideLoad();
	};
	/**
	 * Initializes the form data
	 */
	self.init = function()
	{
		app.init();
		self.loadMap();
		//
		TipoComodidadeService.lista()
			.success(function (data) {
				self.comodidades = data;
				setTimeout(function(){
					$('select').material_select();
					Materialize.updateTextFields();
				},10);
				app.hideLoad();
			})
			.error(function (cause) {
				app.hideLoad();
			});
		//
		if (self.editing) {
			AnuncioService.getAnuncio(self.codAnuncio)
				.success(function (data) {
					if (data.length > 0) {
						self.anuncio = data[0];
						app.createImages(self.anuncio);
						self.verificaCaracteristicaUnidades();
						// ajusta mapa
						if (self.anuncio.enderecoAnuncio != undefined &&
							self.anuncio.enderecoAnuncio.vlrLatitude != undefined &&
							self.anuncio.enderecoAnuncio.vlrLongitude != undefined) {
							self.setPin({lat:self.anuncio.enderecoAnuncio.vlrLatitude, lng:self.anuncio.enderecoAnuncio.vlrLongitude});
						}
						self.__scheduleToShow();
						self.__floatToShow();
						// observa alteracoes do cep
						$scope.$watch('self.anuncio.enderecoAnuncio.numCep', function(){
							self.buscaCep();
						});
						setTimeout(function(){
							$('select').material_select();
							Materialize.updateTextFields();
						},10);
					} else {
						self.editing = false;
					}
					app.hideLoad();
				})
				.error(function (cause) {
					self.editing = false;
					app.hideLoad();
				});
		} else {
			// observa alteracoes do cep
			$scope.$watch('self.anuncio.enderecoAnuncio.numCep', function(){
				self.buscaCep();
			});
		}

		app.createImages(self.anuncio);

		setTimeout(function(){
			$('select').material_select();
			Materialize.updateTextFields();
		},10);
	}
	// submit form
	self.submit = function(anuncio)
	{
		self.__scheduleToSubmit(anuncio);
		self.__floatToSubmit(anuncio);

		if (self.editing) {
			AnuncioService.put(anuncio)
				.success(function (data) {
					app.showMessage('Anuncio alterado!', 'green darken-2');
					$state.go('html.empreendimentoDetalhes', {idAnuncio: data[0].codAnuncio});
					app.hideLoad();
				})
				.error(function (cause) {
					var message = 'Erro gravando anúncio.';
					if (cause != undefined && cause != null && cause.message != undefined)
						message = cause.message;
					app.showMessage(message, 'red darken-3');
					app.hideLoad();
				});
		} else {
			AnuncioService.post(anuncio)
				.success(function (data) {
					app.showMessage('Anuncio criado!', 'green darken-2');
					$state.go('html.empreendimentoDetalhes', {idAnuncio: data.codAnuncio});
					app.hideLoad();
				})
				.error(function (cause) {
					var message = 'Erro gravando anúncio.';
					if (cause != undefined && cause != null && cause.message != undefined)
						message = cause.message;
					app.showMessage(message, 'red darken-3');
					app.hideLoad();
				});
		}
	}
	//
	self.adicionarUnidade = function()
	{
		if (self.anuncio.unidadeAnuncios == undefined)
			self.anuncio.unidadeAnuncios = [];
		self.anuncio.unidadeAnuncios.push({
			caracteristicaUnidades: [
				//Quarto
				{
					codTipoCaracteristica: 1,
					vlrCaracteristica: null
				},
				//Banheiro
				{
					codTipoCaracteristica: 2,
					vlrCaracteristica: null
				},
				//Garagem
				{
					codTipoCaracteristica: 3,
					vlrCaracteristica: null
				},
				//Room - Sala
				{
					codTipoCaracteristica: 4,
					vlrCaracteristica: null
				}
			]});
		setTimeout(function(){
			$('#bloco_unidades').collapsible('open', self.anuncio.unidadeAnuncios.length - 1);
			$('select').material_select();
			Materialize.updateTextFields();
		},10);
	}
	//
	self.removerUnidade = function(uniKey)
	{
		if (self.anuncio.unidadeAnuncios[uniKey] != undefined) {
			self.anuncio.unidadeAnuncios.splice(uniKey, 1);
		}
		return false;
	}
	//
	self.mudarFotoCapaAuto = function(indexUnidade)
	{
		if (self.anuncio.unidadeAnuncios[indexUnidade] != undefined) {
			var codCapa = self.anuncio.unidadeAnuncios[indexUnidade].codDocumentoCapa;
			var imgs = self.anuncio.unidadeAnuncios[indexUnidade].mediaUnidadeAnuncios;
			// se existem imagens
			if (imgs != undefined && imgs.length > 0) {
				if (codCapa != undefined) {
					for (var i in imgs) {
						if (imgs[i].codDocumento == codCapa) {
							// capa existe, ignora
							return;
						}
					}
				}
				// capa nao existe e tem pelo menos uma imagem
				self.anuncio.unidadeAnuncios[indexUnidade].codDocumentoCapa = imgs[0].codDocumento;
			}
		}
	}
	// altera imagem de capa de uma unidade
	self.mudarFotoCapa = function(codImagem, indexUnidade)
	{
		if (self.anuncio.unidadeAnuncios[indexUnidade] != undefined) {
			self.anuncio.unidadeAnuncios[indexUnidade].codDocumentoCapa = codImagem;
			app.createImages(self.anuncio);
		}
	}
	self.removerFoto = function(codImagem, indexUnidade)
	{
		if (self.anuncio.unidadeAnuncios[indexUnidade] != undefined) {
			var imgs = self.anuncio.unidadeAnuncios[indexUnidade].mediaUnidadeAnuncios;
			// se existem imagens
			if (imgs != undefined && imgs.length > 0) {
				for (var i in imgs) {
					if (imgs[i].codDocumento == codImagem) {
						// remove imagemto
						self.anuncio.unidadeAnuncios[indexUnidade].mediaUnidadeAnuncios.splice(i, 1);
						// atualiza se for a capa
						self.mudarFotoCapaAuto(indexUnidade);
						return;
					}
				}
			}
		}
	}

	//
	self.verificaCaracteristicaUnidades = function()
	{
		for(var i in self.anuncio.unidadeAnuncios) {
			if (self.anuncio.unidadeAnuncios[i].caracteristicaUnidades.length == 0) {
				self.anuncio.unidadeAnuncios[i].caracteristicaUnidades = [
					//Quarto
					{ codTipoCaracteristica: 1, vlrCaracteristica: null},
					//Banheiro
					{ codTipoCaracteristica: 2, vlrCaracteristica: null},
					//Garagem
					{ codTipoCaracteristica: 3, vlrCaracteristica: null},
					//Room - Sala
					{ codTipoCaracteristica: 4, vlrCaracteristica: null}
				]
			} else {
				for(var y in self.anuncio.unidadeAnuncios[i].caracteristicaUnidades) {
					if(!self.contemTipoCaracteristica(self.anuncio.unidadeAnuncios[i].caracteristicaUnidades, 1)) {
						var caracteristica = {
						codTipoCaracteristica: 1,
						vlrCaracteristica: null
						};
						self.anuncio.unidadeAnuncios[i].caracteristicaUnidades.push(caracteristica);
					}

					if(!self.contemTipoCaracteristica(self.anuncio.unidadeAnuncios[i].caracteristicaUnidades, 2)) {
						var caracteristica = {
						codTipoCaracteristica: 2,
						vlrCaracteristica: null
						};
						self.anuncio.unidadeAnuncios[i].caracteristicaUnidades.push(caracteristica);
					}

					if(!self.contemTipoCaracteristica(self.anuncio.unidadeAnuncios[i].caracteristicaUnidades, 3)) {
						var caracteristica = {
						codTipoCaracteristica: 3,
						vlrCaracteristica: null
						};
						self.anuncio.unidadeAnuncios[i].caracteristicaUnidades.push(caracteristica);
					}

					if(!self.contemTipoCaracteristica(self.anuncio.unidadeAnuncios[i].caracteristicaUnidades, 4)) {
						var caracteristica = {
						codTipoCaracteristica: 4,
						vlrCaracteristica: null
						};
						self.anuncio.unidadeAnuncios[i].caracteristicaUnidades.push(caracteristica);
					}
				}
			}
		}
	}

	//
	self.contemTipoCaracteristica = function(lista, tipo) {
		var ret = false;
		for(var i in lista) {
			if(lista[i].codTipoCaracteristica === tipo) {
				ret = true;
				break;
			}
		}
		return ret;
	};

	//
	self.buscaCep = function() {
		if (self.anuncio.enderecoAnuncio == undefined)
			return;
		var val = self.anuncio.enderecoAnuncio.numCep;
		if (typeof val != 'string')
			return;
		if (! val.match(/^[0-9]{5}-?[0-9]{3}$/g)) {
			return;
		}
		val = val.replace(/[^0-9]/g, '');
		var url = "https://viacep.com.br/ws/#cep#/json/";
		$.ajax({
			url: url.replace('#cep#', val),
			jsonp: "callback",
			dataType: "jsonp",
			success: function(json) {
				if (json.erro != null && json.erro) {
				} else {
					if (json.logradouro != undefined && json.logradouro != '') {
						self.anuncio.enderecoAnuncio.nomLogradouro = json.logradouro;
						$('#input_logradouro').focus().blur();
					}
					if (json.complemento != undefined && json.complemento != '') {
						self.anuncio.enderecoAnuncio.nomComplemento = json.complemento;
						$('#input_complemento').focus().blur();
					}
					if (json.bairro != undefined && json.bairro != '') {
						self.anuncio.enderecoAnuncio.nomBairro = json.bairro;
						$('#input_bairro').blur().focus();
					}
					if (json.localidade != undefined && json.localidade != '') {
						self.anuncio.enderecoAnuncio.nomCidade = json.localidade;
						$('#input_localidade').focus().blur();
					}
					if (json.uf != undefined && json.uf != '') {
						self.anuncio.enderecoAnuncio.sgUF = json.uf;
						$('#input_uf').focus().blur();
					}
					if (json.unidade != undefined && json.unidade != '') {
						self.anuncio.enderecoAnuncio.numEndereco = json.unidade;
						$('#input_unidade').focus().blur();
					}
					$('#input_cep').focus().blur();
					self.positionMap();
				}
			}
		});
	};
	self.loadMap = function()
	{
		setTimeout(function(){
			var mapPosition = {
				lat:self.anuncio.enderecoAnuncio==undefined||self.anuncio.enderecoAnuncio.vlrLatitude==undefined?-23.533773:self.anuncio.enderecoAnuncio.vlrLatitude,
				lng:self.anuncio.enderecoAnuncio==undefined||self.anuncio.enderecoAnuncio.vlrLongitude==undefined?-46.625290:self.anuncio.enderecoAnuncio.vlrLongitude
			};
			if (typeof google != 'undefined') {
				self.mapObj = new google.maps.Map(document.getElementById('maps'), {
					center: mapPosition,
					zoom: 18,
					panControl: false,
					fullscreenControl: false,
					keyboardShortcuts: false,
					streetViewControl: false
				});
				google.maps.event.addListener(self.mapObj, 'click', function(event) {
					self.setPin({lat:event.latLng.lat(),lng:event.latLng.lng()});
				});
				self.setPin(mapPosition);
			}
		});
	};
	self.positionMap = function()
	{
		// no google? no deal!
		if (typeof google == 'undefined')
			return;
		// no map? no deal!
		if (typeof self.mapObj == 'undefined')
			return;
		if (self.anuncio.enderecoAnuncio == undefined)
			return;
		var address = '"' +
			app.formatarCep(self.anuncio.enderecoAnuncio.numCep) + '"|"' +
			self.anuncio.enderecoAnuncio.sgUF + ' ' +
			self.anuncio.enderecoAnuncio.nomCidade + ' ' +
			self.anuncio.enderecoAnuncio.nomBairro + ' ' +
			self.anuncio.enderecoAnuncio.nomLogradouro + '"|"' +
			self.anuncio.enderecoAnuncio.sgUF + ' ' +
			self.anuncio.enderecoAnuncio.nomCidade + '"';

		MapsService
			.fromCEPorAddress(address)
			.success(function (data) {
				// testa se tudo ok
				switch (data.status) {
					case google.maps.places.PlacesServiceStatus.OK:
						if (data.results.length > 0) {
							// pega primeiro resultado
							var place = data.results[0];
							var mapPosition = place.geometry.location;
							self.setPin(mapPosition);
							self.mapObj.setCenter(mapPosition);
							self.mapObj.setZoom(18);
						}
						break;
					case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
					case google.maps.places.PlacesServiceStatus.NOT_FOUND:
					case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
					case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
					case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
					case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
						// erro no mapa
						break;
				}
				app.hideLoad();
			}).error(function (cause) {
				var message = cause;
				if (cause != undefined && cause.error_message != undefined)
					message = cause.error_message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.setPin = function(latLng)
	{
		if (self.anuncio.enderecoAnuncio == undefined) {
			self.anuncio.enderecoAnuncio = {criei:true};
		}
		self.anuncio.enderecoAnuncio.vlrLatitude = latLng.lat;
		self.anuncio.enderecoAnuncio.vlrLongitude = latLng.lng;
		if (self.mapPin == undefined) {
			self.mapPin = new google.maps.Marker({
				//icon: "modules/App/public/media/img/ico/marker.svg",
				map: self.mapObj,
				position: latLng,
				clickable: false,
				draggable:true,
				animation: google.maps.Animation.DROP
			});
			google.maps.event.addListener(self.mapPin, 'dragend', function() {
				var pos = self.mapPin.getPosition();
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
						latLng: pos
					},
					function(results, status){
						if (status == google.maps.GeocoderStatus.OK){
							// muda pos
							self.anuncio.enderecoAnuncio.vlrLatitude = results[0].geometry.location.lat();
							self.anuncio.enderecoAnuncio.vlrLongitude = results[0].geometry.location.lng();
						} else {
							// erro
						}
					}
				);
			});
		} else {
			self.mapPin.setPosition(latLng);
		}
	};

	self.getCaracteristica = function(data, codTipoCaracteristica) {
		var ret = null;
		for(var index in data.caracteristicaUnidades) {
			if (parseInt(data.caracteristicaUnidades[index].codTipoCaracteristica) === codTipoCaracteristica) {
				ret = index;
				break;
			}
		}
		if(ret === null) {
			ret = { codTipoCaracteristica: codTipoCaracteristica, vlrCaracteristica: null};
			data.caracteristicaUnidades[index].push(ret);
		}
		return ret;
	};

	self.__scheduleToShow = function()
	{
		self.agendaAnuncios = [];
		for (var i in self.anuncio.agendaAnuncios) {
			if (self.agendaAnuncios[self.anuncio.agendaAnuncios[i].codTipoPeriodoDia-1] == undefined)
				self.agendaAnuncios[self.anuncio.agendaAnuncios[i].codTipoPeriodoDia-1] = [];
			self.agendaAnuncios[self.anuncio.agendaAnuncios[i].codTipoPeriodoDia-1][self.anuncio.agendaAnuncios[i].codTipoDiaSemana-1] = true;
		}
	};
	self.__scheduleToSubmit = function(anuncio)
	{
		anuncio.agendaAnuncios = [];
		for (var i in self.agendaAnuncios) {
			for (var j in self.agendaAnuncios[i]) {
				if (self.agendaAnuncios[i][j] == true) {
					anuncio.agendaAnuncios.push({
						codTipoDiaSemana: parseInt(j, 10) + 1,
						codTipoPeriodoDia: parseInt(i, 10) + 1,
						qtdAtendimento: 0
					});
				}
			}
		}
	};
	self.__floatToShow = function()
	{
		for (var i in self.anuncio.unidadeAnuncios) {
			self.anuncio.unidadeAnuncios[i].vlrUnidadeFull = app.formatarDinheiro(self.anuncio.unidadeAnuncios[i].vlrUnidade);
			self.anuncio.unidadeAnuncios[i].vlrUnidadeDescontoFull = app.formatarDinheiro(self.anuncio.unidadeAnuncios[i].vlrUnidadeDesconto);
			self.anuncio.unidadeAnuncios[i].qtdAreaUnidadeFull = app.formatarDinheiro(self.anuncio.unidadeAnuncios[i].qtdAreaUnidade);

		}
	};
	self.__floatToSubmit = function(anuncio)
	{
		for (var i in self.anuncio.unidadeAnuncios) {
			anuncio.unidadeAnuncios[i].vlrUnidade = app.dinheiroParaFloat(anuncio.unidadeAnuncios[i].vlrUnidadeFull);
			anuncio.unidadeAnuncios[i].vlrUnidadeDesconto = app.dinheiroParaFloat(anuncio.unidadeAnuncios[i].vlrUnidadeDescontoFull);
			anuncio.unidadeAnuncios[i].qtdAreaUnidade = app.dinheiroParaFloat(anuncio.unidadeAnuncios[i].qtdAreaUnidadeFull);
		}
	};

}

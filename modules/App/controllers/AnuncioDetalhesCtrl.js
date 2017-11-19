angular.module('App')
	.controller('AnunciosDetalhesCtrl', AnunciosDetalhesCtrl);

AnunciosDetalhesCtrl.$inject = [
	// angular
	'$scope', '$rootScope', '$state', '$stateParams', '$compile',
	// local
	'AnuncioService', 'TipoComodidadeService', 'MapsService',
	'AgendamentoVisitaService', 'OfertaService', 'RegistroInteresseService',
	'MensagemService', 'FavoritoService', 'UsuarioService'
];

function AnunciosDetalhesCtrl($scope, $rootScope, $state, $stateParams, $compile,
	AnuncioService, TipoComodidadeService, MapsService,
	AgendamentoVisitaService, OfertaService, RegistroInteresseService,
	MensagemService, FavoritoService, UsuarioService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;
	self.usuario = $scope.user;

	self.error = false;

	// recebeu codigo do anuncio?
	self.codAnuncio = $stateParams.idAnuncio;
	// recebeu codigo da unidade?
	self.codUnidade = $stateParams.idUnidade;
	// esta na pagina de emrpeendimento?
	self.pagEmpreendimento = ($state.current.name == 'html.empreendimentoDetalhes'||$state.current.name == 'html.empreendimentoDetalhesUnidade');

	// no code, nogo
	if (self.codAnuncio == undefined || self.codAnuncio == '' || self.codAnuncio == 0) {
		$state.go('html.home');
	}

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

	self.filtros = {};
	self.oferta = {};
	self.interesse = {};
	self.mensagem = {};
	self.visita = {};
	self.mensagens = [];
	self.arrVisitas = [];
	self.arrOfertas = [];

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
				app.hideLoad();
			})
			.error(function (cause) {
				app.hideLoad();
			});

		AnuncioService.getAnuncioPublico(self.codAnuncio)
			.success(function (data) {
				if (data.length > 0) {
					self.anuncio = data[0];
			
					for (var i in self.anuncio.unidadeAnuncios) {
						var unid = self.anuncio.unidadeAnuncios[i];
						
						if(unid.unidadeFavorita && unid.unidadeFavorita.length > 0) {
							unid.indFavorito = true;
						} else {
							unid.indFavorito = false;
						}
					}
					
					// testa se usuario deveria estar aqui
					self._verificaPaginaCorreta();
					app.createImages(self.anuncio);

					self.map(self.anuncio.enderecoAnuncio.vlrLatitude + "," + self.anuncio.enderecoAnuncio.vlrLongitude);

					self.calcularFinanciamento();
					self.criarCalendario();

					self.receberMensagens();
					self.receberOfertas();
					self.receberPedidosVisita();
				} else {
					$state.go('html.home');
				}
				self.arrComodidades = self._arrComodidades();
				setTimeout(function(){
					self._abreUnidade();
				},200);
				app.hideLoad();
			})
			.error(function (cause) {
				app.showMessage('Este anúncio não existe.', 'red darken-3');
				app.hideLoad();
				$state.go('html.home');
			});
	};

	$scope.$on('NOVA_MENSAGEM', function(evt, data) {
		self.mensagens.push(data);
		
		setTimeout(function() {
			$scope.$apply(self.mensagens);
			self.scrollMensagem();
		}, 500);

		$rootScope.$broadcast('LIMPAR_NOTIFICACAO');
	});

	self.map = function(address)
	{
		MapsService
			.fromCEPorAddress(address)
			.success(function (data) {
				// testa se tudo ok
				if (typeof google != 'undefined')
				switch (data.status) {
					case google.maps.places.PlacesServiceStatus.OK:
						if (data.results.length > 0) {
							// pega primeiro resultado
							var place = data.results[0];
							var mapPosition = place.geometry.location;
							var pins = [];
							// init gmaps
							(function(){
								try {
									var map = new google.maps.Map(document.getElementById('maps'), {
										backgroundColor: 'transparent',
										center: mapPosition,
										zoom: 16,
										fullscreenControl: false,
										keyboardShortcuts: false,
										panControl: false,
										streetViewControl: false
									});
									var service = new google.maps.places.PlacesService(map);
									// marcador principal
									var base_pin = new google.maps.Marker({
										icon: "modules/App/public/media/img/ico/marker.svg",
										map: map,
										position: mapPosition,
										clickable: false,
										zIndex: 100
									})
									// cria marcadores alternativos
									function callback(results, status) {
										if (status === google.maps.places.PlacesServiceStatus.OK) {
											for (var i = 0; i < results.length; i++) {
												pins.push(new google.maps.Marker({
													icon: "modules/App/public/media/img/ico/marker_blue.svg",
													map: map,
													position: results[i].geometry.location,
													//clickable: false,
													//animation: google.maps.Animation.BOUNCE,
													zIndex: 1
												}));
											}
										}
									}
									function getPins(arrTipos) {
										service.nearbySearch({
											location: mapPosition,
											radius: 800,
											types: arrTipos
										}, callback);
									};
									$('.maps-filter').change(function(){
										var $t = $(this),
											marked = $t.is(":checked"),
											types = $t.data('types'),
											$p = $t.parents('.maps-filter-box');
										$p.find('.maps-filter[id!="' + $t.attr('id') + '"]').attr('checked', false);
										for (var i in pins) {
											pins[i].setMap(null);
										}
										pins = [];
										if (marked) {
											if (typeof types != "undefined") {
												types = types.split(",");
												getPins(types);
											}
										}
									});
								} catch (e) {
									//
								}
							})();
						}
						break;
					case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
					case google.maps.places.PlacesServiceStatus.NOT_FOUND:
					case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
					case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
					case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
					case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
						// erro no mapa
						$('#maps,#maps_filter').hide();
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

	self.calcularFinanciamento = function()
	{
		for (var i in self.anuncio.unidadeAnuncios) {
			var valor = self.anuncio.unidadeAnuncios[i].vlrUnidadeDesconto < self.anuncio.unidadeAnuncios[i].vlrUnidade ?
			self.anuncio.unidadeAnuncios[i].vlrUnidadeDesconto : self.anuncio.unidadeAnuncios[i].vlrUnidade;
			app.calcularFinanciamento(valor+"", i);
		}
	};

	self.modalGaleriaCapas = function(foto)
	{
		$modal = $('.modal');
		var html = '<div class="rslides_container"><ul class="rslides" data-pager="true" data-auto="false">';
		for (var i in self.anuncio.unidadeAnuncios)
			html += '<li><img src="' + self.anuncio.unidadeAnuncios[i].documento.txtSrcOriginal + '" class="z-depth-2" /></li>';
		html += '</ul></div>';
		$modal.find('.modal-content').html($compile(html)($scope));
		$modal.modal('open');
		setTimeout(function(){
			$modal.find('.rslides_btns_tabs').find('a').eq(foto).trigger('click');
		},1000);
	};

	self.modalGaleriaUnidade = function(unidade, foto)
	{
		$modal = $('.modal');
		var html = '<div class="rslides_container"><ul class="rslides" data-pager="true" data-auto="false">';
		for (var i in self.anuncio.unidadeAnuncios[unidade].mediaUnidadeAnuncios)
			html += '<li><img src="' + self.anuncio.unidadeAnuncios[unidade].mediaUnidadeAnuncios[i].txtSrcOriginal + '" class="z-depth-2" /></li>';
		html += '</ul></div>';
		$modal.find('.modal-content').html($compile(html)($scope));
		$modal.modal('open');
		// search for link click after 1.2s
		setTimeout(function(){
			$modal.find('.rslides_btns_tabs').find('a').eq(foto).trigger('click');
		},1200);
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

	self._abreUnidade = function() {
		var toOpen = 0;
		if (self.codUnidade != undefined) {
			for (var uni in self.anuncio.unidadeAnuncios) {
				if (self.anuncio.unidadeAnuncios[uni].codUnidade == self.codUnidade) {
					toOpen = uni;
					break;
				}
			}
			// Para abrir sempre a primeira quando nenhuma selecionada,
			// tirar essa linha do if. :D
			$('.collapsible').collapsible('open', toOpen);
		}
	};

	self._verificaPaginaCorreta = function() {
		// redirect to unit page
		if (self.anuncio.indEmpreendimento != "S" && self.pagEmpreendimento) {
			$state.go('html.anunciosDetalhes', {idAnuncio: self.codAnuncio});
		} else
		// redirect to entrepreneur page
		if (self.anuncio.indEmpreendimento != "N" && ! self.pagEmpreendimento) {
			$state.go('html.empreendimentoDetalhes', {idAnuncio: self.codAnuncio});
		}
	};

	//
	self.enviarPedidoVisita = function()
	{
		// valida
		if (self.diasAgendaSelecionado.dk < 0 || self.diasAgendaSelecionado.tk < 0 || self.diasAgendaSelecionado.m < 0) {
			app.showMessage('Selecione uma data para solicitar a visita.', 'red darken-3');
			return;
		}
		// make obj
		self.visita = {
			codAnuncio: self.anuncio.codAnuncio,
			codTipoPeriodoDia: self.diasAgendaSelecionado.tk,
			dtAgendamentoVisita: self.diasAgendaSelecionado.y + "-" + (self.diasAgendaSelecionado.m+1)+"-"+(self.diasAgendaSelecionado.d)
		};
		// limpa data
		self.diasAgendaSelecionado = {dk:-1,tk:-1,d:-1,m:-1,y:-1};
		// envia
		AgendamentoVisitaService.postComprador(self.visita)
			.success(function(data){
				app.showMessage('Visita solicitada!', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};

	// mensagens
	self.enviarMensagem = function()
	{
		if (self.mensagem.txtMensagem == undefined || self.mensagem.txtMensagem == '') {
			app.showMessage('Digite uma mensagem.', 'red darken-3');
			return;
		}
		self.mensagem.codAnuncio = self.anuncio.codAnuncio;

		MensagemService.post(self.mensagem)
			.success(function(data){
				data.usuario = {
					codUsuario: self.usuario.codigoClienteid,
					nomUsuario: self.usuario.nome
				};
				self.mensagens.push(data);
				self.scrollMensagem();
				//app.showMessage('Mensagem enviada!', 'green darken-2');
				self.mensagem = {};
				app.hideLoad();
			})
			.error(function(cause){
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.receberMensagens = function()
	{
		// logado?
		if (! self.usuario)
			return;
		MensagemService.getComprador(self.anuncio.codAnuncio)
			.success(function(data){
				self.mensagens = data.reverse();
				self.scrollMensagem();
				app.hideLoad();
			})
			.error(function(cause){
				/*
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				*/
				app.hideLoad();
			});
	};
	self.scrollMensagem = function()
	{
		setTimeout(function(){
			$('.message-scroll').scrollTop(9999999999);
		},100);
	};

	//
	self.enviarRegistroDeInteresse = function(codUnidade)
	{
		$('.invalid,.valid').removeClass('valid').removeClass('invalid');
		// validar
		if (self.interesse.txtEmailCliente == undefined || self.interesse.txtEmailCliente == "" ||
			self.interesse.txtCelularCliente == undefined || self.interesse.txtCelularCliente == "" ||
			self.interesse.codTipoPeriodoContato == undefined || self.interesse.codTipoPeriodoContato == "") {
			$('#interesse_email').addClass('invalid');
			$('#interesse_celular').addClass('invalid');
			//$('#interesse_telefone').addClass('invalid');
			$('#interesse_periodo').parent().find('input').addClass('invalid');
			app.showMessage('Preencha todos os campos obrigatórios.', 'red darken-3');
			return;
		}
		if (! self.interesse.txtCelularCliente.match(/^(\(\d\d\)|\d\d) ?(\d{4,5}[- ]?\d{3,4})$/g)) {
			$('#interesse_celular').addClass('invalid');
			app.showMessage('Telefone celular inválido.', 'red darken-3');
			return;
		}
		if (self.interesse.txtTelefoneCliente != undefined && ! self.interesse.txtTelefoneCliente.match(/^((\(\d\d\)|\d\d) ?(\d{4,5}[- ]?\d{3,4}))?$/g)) {
			$('#interesse_telefone').addClass('invalid');
			app.showMessage('Telefone celular inválido.', 'red darken-3');
			return;
		}
		// デフォールト
		self.interesse.codUnidade = codUnidade;
		// envia
		RegistroInteresseService.post(self.interesse)
			.success(function(data){
				self.interesse = {};
				app.showMessage('Registro de interesse enviado!', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				/*
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				*/
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};

	// ofertas
	self.enviarOferta = function(codUnidade)
	{
		$('.invalid,.valid').removeClass('valid').removeClass('invalid');
		// validar
		if (self.oferta.txtEmailCliente == undefined || self.oferta.txtEmailCliente == "" ||
			self.oferta.txtCelularCliente == undefined || self.oferta.txtCelularCliente == "" ||
			self.oferta.vlrOfertaFull == undefined || self.oferta.vlrOfertaFull == "") {
			$('#oferta_email').addClass('invalid');
			$('#oferta_celular').addClass('invalid');
			//$('#oferta_telefone').addClass('invalid');
			$('#oferta_valor').addClass('invalid');
			app.showMessage('Preencha todos os campos obrigatórios.', 'red darken-3');
			return;
		}
		if (! self.oferta.txtCelularCliente.match(/^(\(\d\d\)|\d\d) ?(\d{4,5}[- ]?\d{3,4})$/g)) {
			$('#oferta_celular').addClass('invalid');
			app.showMessage('Telefone celular inválido.', 'red darken-3');
			return;
		}
		if (self.oferta.txtTelefoneCliente != undefined && ! self.oferta.txtTelefoneCliente.match(/^((\(\d\d\)|\d\d) ?(\d{4,5}[- ]?\d{3,4}))?$/g)) {
			$('#oferta_telefone').addClass('invalid');
			app.showMessage('Telefone celular inválido.', 'red darken-3');
			return;
		}
		// default
		self.oferta.codUnidade = codUnidade;
		self.oferta.vlrOferta = app.dinheiroParaFloat(self.oferta.vlrOfertaFull);
		// 出す
		OfertaService.post(self.oferta)
			.success(function(data){
				self.oferta = {};
				app.showMessage('Oferta enviada, aguarde resposta do vendedor.', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.receberOfertas = function()
	{
		// logado?
		if (! self.usuario)
			return;
		// 出す
		OfertaService.getComprador(self.anuncio.unidadeAnuncios[0].codUnidade)
			.success(function(data){
				self.arrOfertas = data;
				// atualiza campos com valor já enviado
				/*
				if (data[data.length-1] != undefined) {
					self.oferta = data[data.length-1];
					self.oferta.vlrOfertaFull = app.formatarDinheiro(data[data.length-1].vlrOferta);
					setTimeout(function(){
						$('select').material_select();
						Materialize.updateTextFields();
					},10);
				}
				*/
				app.hideLoad();
			})
			.error(function(cause){
				/*
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				*/
				app.showMessage(cause.message, 'red darken-3');
				app.hideLoad();
			});
	};

	// visitas
	self.criarCalendario = function()
	{
		if (self.anuncio.agendaAnuncios.length == 0)
			return;
		// add function to prototype
		Date.prototype.addDays = function(days) {
			var dat = new Date(this.valueOf());
			dat.setDate(dat.getDate() + days);
			return dat;
		}
		// sets base date
		var baseDate = new Date();
		baseDate.addDays(1);
		// durds
		var meses = [
			"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
			"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
		];
		// week calendar
		var diasSemana = [];
		for (var i = 0; i < 3; i++) {
			diasSemana[i] = [false,false,false,false,false,false,false];
		}
		for (var i in self.anuncio.agendaAnuncios) {
			if (self.anuncio.agendaAnuncios[i].codTipoPeriodoDia > 0 && self.anuncio.agendaAnuncios[i].codTipoPeriodoDia < 4)
				diasSemana[self.anuncio.agendaAnuncios[i].codTipoPeriodoDia-1][self.anuncio.agendaAnuncios[i].codTipoDiaSemana-1] = true;
		}
		// clean dates arr
		self.diasAgenda = [];
		// limite de dias para marcacao de
		var limiteDiasMarcacao = 40;
		for (var j = 0; j <= limiteDiasMarcacao; j++) {
			baseDate = baseDate.addDays(1);
			var m = diasSemana[0][baseDate.getDay()];
			var a = diasSemana[1][baseDate.getDay()];
			var n = diasSemana[2][baseDate.getDay()];
			var t = m && n && a;
			self.diasAgenda.push({
				disponivel:[t, m, a, n],
				dia:baseDate.getDate(),
				mes:meses[baseDate.getMonth()],
				mesNum:baseDate.getMonth(),
				ano:baseDate.getFullYear()
			});
		}
		self.diasAgendaSelecionado = {dk:-1,tk:-1,d:-1,m:-1,y:-1};
		setTimeout(function(){
			$('.slide-calendar').slick({
				slidesToShow: 8,
				slidesToScroll: 7,
				infinite: false,
				responsive: [
					{ breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 2 } },
					{ breakpoint: 660, settings: { slidesToShow: 4, slidesToScroll: 3 } },
					{ breakpoint: 770, settings: { slidesToShow: 5, slidesToScroll: 4 } },
					{ breakpoint: 992, settings: { slidesToShow: 6, slidesToScroll: 5 } },
					{ breakpoint: 1350, settings: { slidesToShow: 7, slidesToScroll: 6 } }
				]
			});
		}, 20);
	};
	self.receberPedidosVisita = function()
	{
		// logado?
		if (! self.usuario)
			return;
		// 出す
		AgendamentoVisitaService.getComprador(self.anuncio.codAnuncio)
			.success(function(data){
				self.arrVisitas = data;
				app.hideLoad();
			})
			.error(function(cause){
				/*
				var message = 'Erro ao enviar solicitação.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				*/
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
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

'use strict';

angular
	.module('App', [
		'ngRoute',
		'ui.router',
		'angularFileUpload'
	])
	.config(AppConfig)
	.run(AppRun);

AppConfig.$inject = ['$httpProvider'];

function AppConfig($httpProvider) {
	$httpProvider.interceptors.push('AuthJwtHttpInterceptor');
}

AppRun.$inject = ['$q', '$rootScope', '$locale', '$state', '$window', 'AppService', 'UsuarioService'];

function AppRun($q, $rootScope, $locale, $state, $window, AppService, UsuarioService) {
	$locale.NUMBER_FORMATS.GROUP_SEP = '.';
	$locale.NUMBER_FORMATS.DECIMAL_SEP = ',';
	$rootScope.MEDIA_FOLDER = 'modules/App/public/media/';

	angular.element($window).bind('resize', function(){
		$('.material-tooltip').remove();
		// TODO recriar tooltips?
	});

	validarLogin($rootScope, UsuarioService);

	$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams, undefined) {
		verificarPermissoes($rootScope, $state, event, UsuarioService, toState);
	});

	$rootScope.$on('auth.login', function () {
		$state.go('html.home', {}, {reload: true});
	});

	$rootScope.$on('auth.logout', function () {
		validarRotaAnteriorAposLogout($rootScope, $state);
	});

	$rootScope.functions = {
		init: function()
		{
			// kill tooptips on page refresh
			$('.material-tooltip').remove();
			// move page to top
			$('html,body').scrollTop(0);
		},
		showLoad: function()
		{
			if ($rootScope._loads == undefined)
				$rootScope._loads = 0;
			$rootScope._loads++;
			if ($rootScope._loads == 1) {
				setTimeout(function(){
					$('.loading').fadeIn(100);
				}, 0);
			}
		},
		hideLoad: function()
		{
			if ($rootScope._loads == undefined)
				$rootScope._loads = 0;
			if ($rootScope._loads > 0)
				$rootScope._loads--;
			if ($rootScope._loads == 0) {
				setTimeout(function(){
					$('.loading').fadeOut(300);
				},300);
			}
		},
		showMessage: function(str, color)
		{
			setTimeout(function(){
				Materialize.toast(str, 4000);
				if (color != undefined)
					$('.toast').last().addClass(color);
			}, 0);
		},
		// hack para imagens bugadas no ng-src
		// imagens anuncio unico
		createImages: function(anuncio)
		{
			if (anuncio.mediaUnidadeAnuncios != undefined)
			for (var i in anuncio.mediaUnidadeAnuncios) {
				var docu = anuncio.mediaUnidadeAnuncios[i];
				if (docu == undefined || docu.documento == undefined)
					continue;
				else
					docu = docu.documento;
				var hash = docu.txtHash;
				var anun = anuncio.mediaUnidadeAnuncios[i];
				anun.txtSrcOriginal = window.IMAGE_ORIGINAL(hash);
				anun.txtSrcCover = window.IMAGE_COVER(hash);
				anun.txtSrcThumb = window.IMAGE_THUMB(hash);
			}

			if (anuncio.unidadeAnuncios != undefined)
			for (var j in anuncio.unidadeAnuncios) {
				// capa
				if (anuncio.unidadeAnuncios[j].documento != undefined) {
					var hash = anuncio.unidadeAnuncios[j].documento.txtHash;
					anuncio.unidadeAnuncios[j].documento.txtSrcOriginal = window.IMAGE_ORIGINAL(hash);
					anuncio.unidadeAnuncios[j].documento.txtSrcCover = window.IMAGE_COVER(hash);
					anuncio.unidadeAnuncios[j].documento.txtSrcThumb = window.IMAGE_THUMB(hash);
				}
				// imagens
				if (anuncio.unidadeAnuncios[j].mediaUnidadeAnuncios != undefined)
				for (var i in anuncio.unidadeAnuncios[j].mediaUnidadeAnuncios) {
					var docu = anuncio.unidadeAnuncios[j].mediaUnidadeAnuncios[i];
					if (docu == undefined || docu.documento == undefined)
						continue;
					else
						docu = docu.documento;
					var hash = docu.txtHash;
					var unid = anuncio.unidadeAnuncios[j].mediaUnidadeAnuncios[i];
					unid.txtSrcOriginal = window.IMAGE_ORIGINAL(hash);
					unid.txtSrcCover = window.IMAGE_COVER(hash);
					unid.txtSrcThumb = window.IMAGE_THUMB(hash);
				}
			}
		},
		// hack para imagens bugadas no ng-src
		// imagens em lista de anuncios
		createImagesLista: function(anuncios)
		{
			//
			for (var k in anuncios) {
				// capa
				if (anuncios[k].documento != undefined) {
					var hash = anuncios[k].documento.txtHash;
					anuncios[k].documento.txtSrcOriginal = window.IMAGE_ORIGINAL(hash);
					anuncios[k].documento.txtSrcCover = window.IMAGE_COVER(hash);
					anuncios[k].documento.txtSrcThumb = window.IMAGE_THUMB(hash);
				}
				//
				if (anuncios[k].unidadeAnuncios != undefined)
				for (var j in anuncios[k].unidadeAnuncios) {
					var unid = anuncios[k].unidadeAnuncios[j].documento;
					if (unid == undefined)
						continue;
					var hash = unid.txtHash;
					unid.txtSrcOriginal = window.IMAGE_ORIGINAL(hash);
					unid.txtSrcCover = window.IMAGE_COVER(hash);
					unid.txtSrcThumb = window.IMAGE_THUMB(hash);
				}
			}
		},
		formatarCep: function(numero)
		{
			return (numero+"").replace(/^([0-9]{5})([0-9]{3})$/g, "$1-$2");
		},
		formatarDinheiro: function(numero)
		{
			if (numero != undefined && numero.formatMoney != undefined) {
			 	return numero.formatMoney(2, ',', '.');
			} else {
				if (typeof numero == 'string') {
					numero.replace(/^([0-9]{1,3})(?:[\.,]?([0-9]{3}))(?:[\.,]?([0-9]{3}))(?:[\.,]?([0-9]{3}))(?:(.,[0-9]+))$/g, '$1$2$3$4$5')
					.replace(/,/g, '.');
				}
				numero = parseFloat(numero).toFixed(2);
				numero += "";
				var regex = /(\d)(\d{3})(\.\d{3})*(?:[\.,](\d\d))?$/g;
				while(numero.match(regex)) {
					numero = numero.replace(regex, '$1.$2$3,$4');
				}
				return numero;
			}
		},
		calcularFinanciamento: function(valor, idExtra)
		{
			if (idExtra == undefined)
				idExtra = '';
			if (typeof valor != "number") {
				if (valor.match(/^[0-9]+(\.[0-9]+)?$/g)) {
					var clean_value = parseFloat(valor);
				} else {
					var clean_value = parseFloat(valor.replace(/[^,0-9]/g, "").replace(",", "."));
				}
			} else
				var clean_value = valor;
			var minimo_financiado = 20000;
			var $bloco_resultado = $('#valores_simulacao,.valores_simulacao');
			if (clean_value >= minimo_financiado && clean_value < 5000000.01) {
				$bloco_resultado.slideDown();
				var base = simulador.calcular(clean_value),
					dados = base.dados,
					err = base.erro;
				// get out of ns context
				setTimeout(function(){
					$('#valor_salario'+idExtra+',.valor_salario'+idExtra).html("R$&nbsp;" + dados.renda.formatMoney(2, ',', '.'));
					$('#valor_financiado'+idExtra+',.valor_financiado'+idExtra).html("R$&nbsp;" + dados.financiamento.formatMoney(2, ',', '.'));
					$('#valor_prestacao'+idExtra+',.valor_prestacao'+idExtra).html("R$&nbsp;" + dados.prestacao.formatMoney(2, ',', '.'));
				},50);
			} else {
				$bloco_resultado.slideUp();
			}
		},
		dinheiroParaFloat: function(valor)
		{
			return parseFloat(valor.replace(/[^,0-9]/g, "").replace(",", ".")).toFixed(2);
		},
		dateToStrBR: function(date)
		{
			var d = new Date(date);
			return d.getUTCDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
		},
		dateToWeekDayBR: function(date)
		{
			var ds = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
			var d = new Date(date);
			return ds[d.getDay()];
		},
		initialsOnly: function(str)
		{
			return str.trim().replace(/^(?:([^ ])[^ ]*)(?:.*?)?(?: ([^ ])[^ ]*)?$/g,'$1$2');
		},
		codPeriodoToStr: function(codigo)
		{
			var ps = ['Manhã', 'Tarde', 'Noite'];
			var i = parseInt(codigo, 10) - 1;
			return ps[i % ps.length];
		},
		// visita
		codEstadoVisitaToStr: function(codEstadoVisita)
		{
			var status = ['','Aguardando resposta', 'Confirmado', 'Cancelado', 'Cancelado pelo Usuário'];
			return status[codEstadoVisita];
		},
		codEstadoVisitaToClass: function(codEstadoVisita)
		{
			var classes = ['','red-text text-darken-2', 'green-text text-darken-1', 'red-text text-darken-2'];
			return classes[codEstadoVisita];
		},
		codEstadoVisitaToIndicatorClass: function(codEstadoVisita)
		{
			var classes = ['','', 'success', 'warn'];
			return classes[codEstadoVisita];
		},
		// oferta
		codEstadoOfertaToStr: function(codEstadoVisita)
		{
			var status = ['','Aguardando resposta', 'Confirmado', 'Cancelado', 'Cancelado pelo Cliente'];
			return status[codEstadoVisita];
		},
		codEstadoOfertaToClass: function(codEstadoVisita)
		{
			var classes = ['','red-text text-darken-2', 'green-text text-darken-1', 'red-text text-darken-2'];
			return classes[codEstadoVisita];
		},
		codEstadoOfertaToIndicatorClass: function(codEstadoVisita)
		{
			var classes = ['','', 'success', 'warn'];
			return classes[codEstadoVisita];
		},
		// interesse
		codEstadoInteresseToStr: function(codEstadoVisita)
		{
			var status = ['','Aguardando contato', 'Já contactado', 'Não contactado'];
			return status[codEstadoVisita];
		},
		codEstadoInteresseToClass: function(codEstadoVisita)
		{
			var classes = ['','red-text text-darken-2', 'green-text text-darken-1', 'red-text text-darken-2'];
			return classes[codEstadoVisita];
		},
		codEstadoInteresseToIndicatorClass: function(codEstadoVisita)
		{
			var classes = ['','', 'success', 'warn'];
			return classes[codEstadoVisita];
		}
	};
}

function validarLogin($rootScope, UsuarioService) {
	var qp = null;

	if (window.location.hash) {
		qp = location.hash.substring(1);
	} else {
		qp = location.search.substring(1);
	}

	var re = /(.*?)(login=true)(.*?)/;
	var found = qp.match(re);

	if (found) {
		UsuarioService.validarLogin()
			.then(function (usuario) {
				$rootScope.user = usuario;
				$rootScope.$broadcast('auth.login');
			});
	}

	if (UsuarioService.estaAutenticado()) {
		UsuarioService.obterUsuario();
		$rootScope.user = UsuarioService.obterUsuario();
		$rootScope.$broadcast('auth.login');
	}
}

function verificarPermissoes($rootScope, $state, event, UsuarioService, toState) {
	if(!rotaPossuiNivelAcesso(toState)) {
		return;
	}

	if(UsuarioService.estaAutenticado()) {
		var usuario = UsuarioService.obterUsuario();
		if(!window.RBAC.authorize(toState.data.ACCESS_LEVEL, usuario.roles)) {
			event.preventDefault();
			$state.go('html.login', {}, {reload: true});
		}
	} else {
		if(!rotaPublica(toState)) {
			event.preventDefault();
			$state.go('html.login', {}, {reload: true});
		}
	}

		if(toState.name !== 'html.login') {
		$rootScope.lastState = {
			name: toState.name,
			data: toState.data
		};
	}
}

function rotaPossuiNivelAcesso(toState) {
	return ('data' in toState) && ('ACCESS_LEVEL' in toState.data);
}

function rotaPublica(toState) {
	return window.RBAC.authorize(toState.data.ACCESS_LEVEL, window.RBAC.ROLE.GUEST);
}

function validarRotaAnteriorAposLogout($rootScope, $state) {
	if(!$rootScope.lastState) {
		return;
	}

	if(!rotaPublica($rootScope.lastState)) {
		$state.go('html.home', {}, {reload: true});
	}
}

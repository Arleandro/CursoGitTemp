angular.module('App')
.directive('messageTitle', MessageLine)
.controller('NotificacoesCtrl', NotificacoesCtrl);

NotificacoesCtrl.$inject = [
// angular
'$scope', '$rootScope', '$state', '$compile', '$stateParams',
// local
'AnuncioService', 'AgendamentoVisitaService', 'RegistroInteresseService', 'OfertaService', 'MensagemService'
];

function NotificacoesCtrl($scope, $rootScope, $state, $compile, $stateParams,
AnuncioService, AgendamentoVisitaService, RegistroInteresseService, OfertaService, MensagemService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;
	self.usuario = $scope.user;

	self.interesses = [];
	self.visitas = [];
	self.ofertas = [];
	self.mensagens = [];
	self.today = new Date();

	self.init = function()
	{
		app.init();

		RegistroInteresseService.getVendedor()
			.success(function(data){
				self.interesses = data;
				app.hideLoad();
			})
			.error(function(cause){
				app.hideLoad();
			});

		AgendamentoVisitaService.getVendedor()
			.success(function(data){
				self.visitas = data;
				app.hideLoad();
			})
			.error(function(cause){
				app.hideLoad();
			});

		OfertaService.getVendedor()
			.success(function(data){
				self.ofertas = data;
				app.hideLoad();
			})
			.error(function(cause){
				app.hideLoad();
			});

		MensagemService.getVendedor()
			.success(function(data){
				self.mensagens = data;
				app.hideLoad();
			})
			.error(function(cause){
				app.hideLoad();
			});
	};

	$scope.$on('NOVA_MENSAGEM', function(evt, data) {
		angular.forEach(self.mensagens, function(mensagem, index) {
			angular.forEach(mensagem.canalMensagems, function(canalMensagem, index2) {
				var codigo = data.codCanal ? data.codCanal : data.codAnuncio;
				if (canalMensagem.codCanal === codigo) {
					if (canalMensagem.mensagens) {
						canalMensagem.mensagens.push(data);
						setTimeout(function() {
							$scope.$apply(self.mensagens);
							self.scrollMensagem();
						}, 500);

					}
				}
			});
		});

		$rootScope.$broadcast('LIMPAR_NOTIFICACAO');
		
	});

	$scope.$on('NOVO_AGENDAMENTO', function(evt, novoAgendamento) {
//		var anuncioVisitas = null;
//		
//		if(self.visitas.length === 0 || (anuncioVisitas = getAnuncioVisitas(novoAgendamento.codAnuncio)) === null) {
			AgendamentoVisitaService.getVendedor()
				.success(function(data){
					self.visitas = data;
					app.hideLoad();
				})
				.error(function(cause){
					app.hideLoad();
				});
//		} else {
//			anuncioVisitas.agendamentoVisita.push(novoAgendamento);
//			setTimeout(function() {
//				$scope.$apply(self.visitas);
//			}, 500);
//		}

		$rootScope.$broadcast('LIMPAR_NOTIFICACAO');
	});
	
	function getAnuncioVisitas(codAnuncio) {
		var anuncioVisitas = null;
		
		angular.forEach(self.visitas, function(anuncio, index) {
			if(anuncio.codAnuncio === codAnuncio) {
				anuncioVisitas = anuncio;
			}
		});
		
		return anuncioVisitas;
	}
	
	// visitas
	self.visitaAceitar = function(visita,codVisita,codAnuncio)
	{
		visita.codTipoEstadoAgendamentoVisita = 2;
		AgendamentoVisitaService.patch(visita)
			.success(function(data){
				self.visitas[codAnuncio].agendamentoVisita[codVisita].codTipoEstadoAgendamentoVisita = data.codTipoEstadoAgendamentoVisita;
				self.visitas[codAnuncio].agendamentoVisita[codVisita].tsRespostaAgendamento = data.tsRespostaAgendamento;
				app.showMessage('Pedido de visita aceito!', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				self.visitas[codAnuncio].agendamentoVisita[codVisita].codTipoEstadoAgendamentoVisita = 1;
				var message = 'Erro aceitando pedido de visita.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.visitaRecusar = function(visita,codVisita,codAnuncio)
	{
		visita.codTipoEstadoAgendamentoVisita = 3;
		AgendamentoVisitaService.patch(visita)
			.success(function(data){
				self.visitas[codAnuncio].agendamentoVisita[codVisita].codTipoEstadoAgendamentoVisita = data.codTipoEstadoAgendamentoVisita;
				self.visitas[codAnuncio].agendamentoVisita[codVisita].tsRespostaAgendamento = data.tsRespostaAgendamento;
				app.showMessage('Pedido de visita recusado.', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				self.visitas[codAnuncio].agendamentoVisita[codVisita].codTipoEstadoAgendamentoVisita = 1;
				var message = 'Erro recusando pedido de visita.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};

	// oferta
	self.ofertaAceitar = function(oferta)
	{
		oferta.codTipoEstadoOferta = 2;
		OfertaService.patch(oferta)
			.success(function(data){
				oferta = data;
				app.showMessage('Oferta aceita!', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				oferta.codTipoEstadoOferta = 1;
				var message = 'Erro aceitando oferta.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.ofertaRecusar = function(oferta)
	{
		oferta.codTipoEstadoOferta = 3;
		OfertaService.patch(oferta)
			.success(function(data){
				oferta = data;
				app.showMessage('Oferta recusada.', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				oferta.codTipoEstadoOferta = 1;
				var message = 'Erro recusando oferta.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};

	// テャット
	self.mensagemCarregarCanal = function(codAnuncio, codCanal, kAnu, kCan)
	{
		if (self.mensagens[kAnu].canalMensagems[kCan].mensagens != undefined &&
			self.mensagens[kAnu].canalMensagems[kCan].mensagens.length > 0)
			return;
		MensagemService.getCanal(codAnuncio, codCanal)
			.success(function(data){
				self.mensagens[kAnu].canalMensagems[kCan].mensagens = data;
				self.scrollMensagem();
				app.hideLoad();
			})
			.error(function(cause){
				app.hideLoad();
			});
	};
	self.mensagemEnviar = function(codAnuncio, codCanal, kAnu, kCan)
	{
		if (self.txt[kCan] == undefined || self.txt[kCan] == '') {
			app.showMessage('Digite uma mensagem.', 'red darken-3');
			return;
		}
		var objMensagem = {
			codAnuncio: codAnuncio,
			codCanal: codCanal,
			txtMensagem: self.txt[kCan]
		};
		self.txt[kCan] = "";

		MensagemService.post(objMensagem)
			.success(function(data){
				data.usuario = {
					codUsuario: self.usuario.codigoClienteid,
					nomUsuario: self.usuario.nome
				};
				self.mensagens[kAnu].canalMensagems[kCan].mensagens.push(data);
				self.scrollMensagem();
				//app.showMessage('Mensagem enviada!', 'green darken-2');
				app.hideLoad();
			})
			.error(function(cause){
				var message = 'Erro ao enviar mensagem.';
				if (cause != undefined && cause.message != undefined) {
					message = cause.message;
				}
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.scrollMensagem = function()
	{
		setTimeout(function(){
			$('.message-scroll').scrollTop(9999999999);
		},100);
	};

	// interesse
	self.interesseContactado = function(interesse)
	{
		interesse.codTipoResposta = 2;
		RegistroInteresseService.patch(interesse)
			.success(function(data){
				interesse = data;
				app.hideLoad();
			})
			.error(function(cause){
				interesse.codTipoResposta = 1;
				var message = 'Erro marcando interesse como contactado.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};
	self.scrollMensagem = function()
	{
		setTimeout(function(){
			$('.message-scroll').scrollTop(9999999999);
		},100);
	};

	// interesse
	self.interesseContactado = function(interesse)
	{
		interesse.codTipoResposta = 2;
		RegistroInteresseService.patch(interesse)
			.success(function(data){
				interesse = data;
				app.hideLoad();
			})
			.error(function(cause){
				interesse.codTipoResposta = 1;
				var message = 'Erro marcando interesse como contactado.';
				if (cause != undefined && cause != null && cause.message != undefined)
					message = cause.message;
				app.showMessage(message, 'red darken-3');
				app.hideLoad();
			});
	};

}


MessageLine.$inject = [];
function MessageLine() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.click(function(){
				$(this).parent().find('.message-details').slideToggle(200);
			});
		}
	}
}

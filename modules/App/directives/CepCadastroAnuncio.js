'use strict';
angular
	.module('App')
	.directive('cepCadastroAnuncio', CepCadastroAnuncio);

CepCadastroAnuncio.$inject = [];

function CepCadastroAnuncio() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.on('paste keyup input', function() {
				var val = $(this).val();
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
							if (typeof json.logradouro != 'undefined' && json.logradouro != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.nomLogradouro = json.logradouro;
								$('#input_logradouro').focus().blur();
							}
							if (typeof json.complemento != 'undefined' && json.complemento != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.nomComplemento = json.complemento;
								$('#input_complemento').focus().blur();
							}
							if (typeof json.bairro != 'undefined' && json.bairro != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.nomBairro = json.bairro;
								$('#input_bairro').blur().focus();
							}
							if (typeof json.localidade != 'undefined' && json.localidade != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.nomCidade = json.localidade;
								$('#input_localidade').focus().blur();
							}
							if (typeof json.uf != 'undefined' && json.uf != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.sgUF = json.uf;
								$('#input_uf').focus().blur();
							}
							if (typeof json.unidade != 'undefined' && json.unidade != '') {
								$scope.ctrl.anuncio.enderecoAnuncio.numEndereco = json.unidade;
								$('#input_unidade').focus().blur();
							}
							$el.focus();
						}
					}
				});
			});
		}
	}
}

'use strict';

angular
	.module('App')
	.directive('calculadora', Calculadora);

Calculadora.$inject = ['$rootScope'];

function Calculadora($rootScope) {
	var app = $rootScope.functions;
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			function calcularFinanciamento() {
				var valor = $(this).val();
				app.calcularFinanciamento(valor);
			}
			$el.maskMoney({prefix:'R$ ', allowNegative: false, thousands:'.', decimal:',', affixesStay: true});
			$el.on('input change paste keyup', calcularFinanciamento);
			setTimeout(function(){
				$el.each(calcularFinanciamento);
			}, 1000);
		}
	}
}

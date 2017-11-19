'use strict';

angular
	.module('App')
	.directive('datepicker', Datepicker)
	.directive('dateFormat', DateFormat);

Datepicker.$inject = [];

function Datepicker() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			setTimeout(function(){
				$el.pickadate({
					today: 'Hoje',
					clear: 'Limpar',
					format: 'dd/mm/yyyy',
					close: 'Ok',

					weekdaysFull: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
					weekdaysShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
					weekdaysLetter: ['Do','Se','Te','Qua','Qui','Sex','Sab','Do'],
					monthsFull: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
					monthsShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],

					labelMonthNext: 'Próximo mês',
					labelMonthPrev: 'Mês anterior',
					labelMonthSelect: 'Selecione um mês',
					labelYearSelect: 'Selecione um ano',

					selectYears: 1,
					selectMonths: true,
					closeOnSelect: false,
					changeYear: true
				});
			}, 300);
		}
	}
}

DateFormat.$inject = ['$filter'];
function DateFormat($filter) {
	return {
		restrict: 'C',
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			ctrl.$parsers.push(function(value) {
				if(! value || value === "") {
					return null;
				}
				value = value.split('/').reverse().join('-');
				var formattedValue = $filter('date')(value, 'yyyy-MM-dd');
				return formattedValue;
			});
			ctrl.$formatters.push(function(value) {
				var re = /^(\d{4})-(\d\d)-(\d\d)/g;
				var parts = re.exec(value);
				if (parts != null) {
					return parts[3] + '/' + parts[2] + '/' + parts[1];
				}
				return "";
			});
		}
	};
};



/**
 * <input type="text" ng-model="dataInicio" empty-to-null/>
 */
function emptyToNull() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			ctrl.$parsers.push(function(value) {
				if(value === "") {
					return null;
				}
				return value;
			});
		}
	};
};

'use strict';

angular
	.module('App')
	.directive('rslides', RSlides);

RSlides.$inject = [];
function RSlides() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			setTimeout(function(){
				/* TODO: adicionar filtros por data-nav, data-pager e data-auto */
				$el.responsiveSlides({
					auto: $el.data('auto') == false?false:true,
					pager: $el.data('pager') == true?true:false,
					nav: true,
					prevText: '<i class="material-icons white-text">arrow_back</i>',
					nextText: '<i class="material-icons white-text">arrow_forward</i>',
					speed: 200,
					timeout: 2000,
					namespace: 'rslides_btns'
				});
			}, 1000);
		}
	}
}

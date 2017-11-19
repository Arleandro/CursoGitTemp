'use strict';

angular
	.module('App')
	.directive('scrollAncora', ScrollAncora);

ScrollAncora.$inject = [];

function ScrollAncora() {
	return {
		restrict: 'AC',
		link: function (scope, elem, attrs) {
			elem.bind('click', function() {
				try {
					var target = $('#' + elem.data('scroll-ancora'));

					if(target.size() > 0) {
						var altura_menu = 0;

						if ($('.navbar-fixed').size() > 0)
							altura_menu = $('.navbar-fixed').first().height();

						$('html, body').animate({
							scrollTop : target.offset().top - altura_menu // menu offset
						}, 1000);
					}
				} catch(err) {
				}
			});
		}
	};
}

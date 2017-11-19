'use strict';

angular
	.module('App')
	.directive('menuMobile', MenuMobile);

MenuMobile.$inject = [];

function MenuMobile() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.sideNav();
		}
	}
}

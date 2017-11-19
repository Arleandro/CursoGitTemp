'use strict';

angular
	.module('App')
	.directive('closeMenu', CloseMenu);

CloseMenu.$inject = [];

function CloseMenu() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.click(function(){
				$('.button-collapse').sideNav('hide');
			});
		}
	}
}

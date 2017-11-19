'use strict';

angular
	.module('App')
	.directive('parallax', Parallax);

Parallax.$inject = [];

function Parallax() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.parallax();
		}
	}
}

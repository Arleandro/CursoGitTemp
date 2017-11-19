'use strict';

angular
	.module('App')
	.directive('collapsible', Accordion);

Accordion.$inject = [];

function Accordion() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$el.collapsible();
		}
	}
}

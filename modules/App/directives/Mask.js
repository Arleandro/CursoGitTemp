'use strict';

angular
	.module('App')
	.directive('mask', Mask);

Mask.$inject = [];

function Mask() {
	return {
		restrict: 'A',
		link: function ($scope, $el, attrs) {
			$el.mask(
				$el.data('mask'),
				{
					reverse: $el.data('mask-reverse') === true,
					removeMaskOnSubmit: true,
					translation:  {'Z': {pattern: /[0-9]/, optional: true}}
				}
			);
		}
	}
}

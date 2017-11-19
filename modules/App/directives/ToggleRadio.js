'use strict';

angular
	.module('App')
	.directive('toggleRadio', ToggleRadio);

ToggleRadio.$inject = [];

function ToggleRadio() {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			$($el).on('mouseup', function(){
				$el.prop('checked', false);
			});
		}
	}
}

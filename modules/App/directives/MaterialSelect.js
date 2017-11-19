'use strict';

angular
	.module('App')
	.directive('materialSelect', MaterialSelect);

MaterialSelect.$inject = [];

function MaterialSelect() {
	return {
		restrict: 'C',
		link: function($scope, $el, attrs) {
			setTimeout(function(){
				$el.material_select();
			}, 200);
		}
	}
}

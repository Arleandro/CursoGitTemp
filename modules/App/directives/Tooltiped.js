'use strict';

angular
	.module('App')
	.directive('tooltip', Tooltiped);

Tooltiped.$inject = [];

function Tooltiped() {
	return {
		restrict: 'A',
		link: function ($scope, $el, attrs) {
			setTimeout(function(){
				$el.tooltip({
					delay: 10,
					position: "bottom",
					tooltip: $el.attr("title")
				})
			},200);
		}
	}
}

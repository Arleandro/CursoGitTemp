'use strict';

angular
	.module('App')
	.directive('modal', Modal);

Modal.$inject = ['MapsService', '$rootScope'];

function Modal(MapsService, $rootScope) {
	return {
		restrict: 'C',
		link: function ($scope, $el, attrs) {
			setTimeout(function(){
				$el.modal();
			},10);
		}
	}
}

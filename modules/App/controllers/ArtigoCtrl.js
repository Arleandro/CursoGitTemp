angular
	.module('App')
	.controller('ArtigoCtrl', ArtigoCtrl);

ArtigoCtrl.$inject = ['$scope'];

function ArtigoCtrl($scope, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	self.versao = '';

	self.init = function(){
	};

}

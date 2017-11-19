angular.module('App')
	.controller('BemVindoCtrl', BemVindoCtrl);

BemVindoCtrl.$inject = ['$scope', '$state'];

function BemVindoCtrl($scope, $state) {
	var self = this;
	var app = $scope.functions;
	self.app = app;
	self.MEDIA_FOLDER = $scope.MEDIA_FOLDER;

	self.init = function(){
		app.init();
	};
}

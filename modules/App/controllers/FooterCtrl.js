angular
	.module('App')
	.controller('FooterCtrl', FooterCtrl);

FooterCtrl.$inject = ['$scope', 'AppService'];

function FooterCtrl($scope, AppService, undefined) {
	var self = this;
	var app = $scope.functions;
	self.app = app;

	self.versao = '';

	self.init = function(){
	AppService.versao()
		.success(function (data) {
			self.versao = data;
			app.hideLoad();
		}).error(function (cause) {
			app.hideLoad();
		});
	};
}

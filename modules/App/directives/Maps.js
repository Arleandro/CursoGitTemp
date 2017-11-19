'use strict';

angular
	.module('App')
	.directive('mapusu', Maps);

Maps.$inject = ['MapsService', '$rootScope'];

function Maps(MapsService, $rootScope) {
	var app = $rootScope.functions;
	return {
		restrict: 'CA',
		link: function ($scope, $el, attrs) {
			/**
			 * Requisita os dados do cep
			 */
			 if (typeof google != 'undefined')
			setTimeout(function(){
			MapsService
				.fromCEP(attrs.cep)
				.success(function (data) {
					var infowindow;
					// testa se tudo ok
					if (data.status === google.maps.places.PlacesServiceStatus.OK && data.results.length > 0) {
						// pega primeiro resultado
						var place = data.results[0];
						var mapPosition = place.geometry.location;
						var pins = [];
						// init gmaps
						(function(){
							try {
								var map = new google.maps.Map(document.getElementById('maps'), {
									backgroundColor: 'transparent',
									center: mapPosition,
									zoom: 16,
									fullscreenControl: false,
									keyboardShortcuts: false,
									panControl: false,
									streetViewControl: false
								});
								var service = new google.maps.places.PlacesService(map);
								// marcador principal
								var base_pin = new google.maps.Marker({
									icon: "modules/App/public/media/img/ico/marker.svg",
									map: map,
									position: mapPosition,
									clickable: false,
									zIndex: 100
								})
								// cria marcadores alternativos
								function callback(results, status) {
									if (status === google.maps.places.PlacesServiceStatus.OK) {
										for (var i = 0; i < results.length; i++) {
											pins.push(new google.maps.Marker({
												icon: "modules/App/public/media/img/ico/marker_blue.svg",
												map: map,
												position: results[i].geometry.location,
												//clickable: false,
												//animation: google.maps.Animation.BOUNCE,
												zIndex: 1
											}));
										}
									}
								}
								function getPins(arrTipos) {
									service.nearbySearch({
										location: mapPosition,
										radius: 800,
										types: arrTipos
									}, callback);
								}
								$('.maps-filter').change(function(){
									var $t = $(this),
										marked = $t.is(":checked"),
										types = $t.data('types'),
										$p = $t.parents('.maps-filter-box');
									$p.find('.maps-filter[id!="' + $t.attr('id') + '"]').attr('checked', false);

									for (var i in pins) {
										pins[i].setMap(null);
									}
									pins = [];

									if (marked) {
										if (typeof types != "undefined") {
											types = types.split(",");
											getPins(types);
										}
									}
								});
							} catch (e) {
								//
							}
						})();

						/*
						// Try HTML5 geolocation.
						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(function(position) {
								var pos = {
									lat: position.coords.latitude,
									lng: position.coords.longitude
								};

								infoWindow.setPosition(pos);
								infoWindow.setContent('Location found.');
								map.setCenter(pos);
							}, function() {
								handleLocationError(true, infoWindow, map.getCenter());
							});
						} else {
							// Browser doesn't support Geolocation
							handleLocationError(false, infoWindow, map.getCenter());
						}
						var handleLocationError = function(browserHasGeolocation, infoWindow, pos) {
							infoWindow.setPosition(pos);
							infoWindow.setContent(browserHasGeolocation ?
								'Error: The Geolocation service failed.' :
								'Error: Your browser doesn\'t support geolocation.'
							);
						}
						*/
					}
				}).error(function (cause) {
					if (typeof cause != 'undefined')
						app.showMessage(cause.error_message, 'red darken-3');
				});
			},500);
		}
	}
}

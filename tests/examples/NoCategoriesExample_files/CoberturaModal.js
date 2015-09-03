define(function(require) {
	var Geolocate 	= require('Geolocation/Geolocate');
	var Modal 		= require('Tools/Modal');
	var Storage		= require('Utils/Storage');
	var EnCobertura 	= require('Geolocation/EnCobertura');
	var SelfLocation 	= require('Tools/SelfLocation');
	var GeoSession		= require('Geolocation/GeoSession');

	function CoberturaModal() {
		var modalCallback = false;
		var modal = new Modal('validaCobertura');//(, {close: false});
			modal.set('content', $('#coberturaModal').html())

		// Bind del modal de cobertura
		new Geolocate('.validaCobertura form', function(response) {
			if(response) {
				Storage.value('geo_address', JSON.stringify(response));
				// Verificar cobertura
				new GeoSession(response, function() {
					Storage.value('geo_address', JSON.stringify(response));
					checkCoverage(response);
				});
			} else {
				modal.hide();
				// Abrir mapa
				SelfLocation.show(function(lat, lng, address) {
					if(lat === false) {
						return false;
					}

					var response = {
						search: {address: address}
					};

					$('.modal .cobertura_address select, .modal .cobertura_address input[type!="hidden"]').each(function() {
						response[$(this).attr('name')] = $(this).val()
					})

					response.lat = lat;
					response.lng = lng;

					new GeoSession(response, function() {
						Storage.value('geo_address', JSON.stringify(response));
						checkCoverage(response);
					});
				})
			}
		})

		function checkCoverage(geo) {
			new EnCobertura(window.establecimiento_id, geo, function(data) {
				if(data && data.response && 'redireccionar' in data) {
					//if(app.embed) data.redireccionar = '/embed' + data.redireccionar;
					if(data.redireccionar.indexOf('?') !== -1) data.redireccionar = data.redireccionar.split('?')[0];

					window.location.href = data.redireccionar;
					return false;
				}

				if(modalCallback && typeof modalCallback == 'function') {
					modalCallback(data, geo);
				}

				// Agrego click al primer botón (.check-other) la info que devolvió el GEO
				var arrayQuery 	   = geo.form || {};
					arrayQuery.lat = geo.lat;
					arrayQuery.lng = geo.lng;

				// Elimina todo lo que no sea lat, lng, readable o dirN
				for(var i in arrayQuery) {
					if(i.match(/dir[0-9]|lat|lng|readable/g) === null) {
						delete arrayQuery[i];
					}
				}

				$('.check-other').attr('href', $('.check-other').attr('href') + '?' + $.serialize(arrayQuery) )

				// Si tengo info del $('.address-search'), lo actualizo de una vez:
				// esto es igual a lo que se hace en Cobertura.js

				if($('.address-search').length) {
					$('.address-search .button').removeClass('loading');

					if(data) {
						$('.address-search').addClass('result');
						$('.address-search .visible').removeClass('visible');

						// Mostrar la vista que corresponda según la respuesta de cobertura del servidor..
						if(data.response !== false) {
							// Se actualizan las variables en el perfil...
							window.min_order 		 = parseInt(data.response.pedido_minimo);
							window.funcion_domicilio = data.response.funcion_domicilio;

							$('.funcion-view').text(data.response.funcion_domicilio.split('|')[0]);
							$('.address-search .success').addClass('visible');
						} else {
							// No cubre..
							$('.address-search .error').addClass('visible');
						}
					}
				}

				// Cierro el modal de cobertura
				modal.hide();
			});
		}

		function modalCobertura(callback) {
			modalCallback = callback;
			modal.show();
		}

		return {
			conCobertura: function() {
				// Si tengo una dirección entonces siempre dejo usar el carrito
				// si no tengo, abro el modal dependiendo de si tiene o no cobertura
				return (window.haveAddress) ? 1 : window.tengoCobertura;
			},
			modalCobertura: modalCobertura,
			callback: function(set) {
				modalCallback = set;
				// Cuando ocurra el proximo evento se ejecuta este callback
			}
		}
	}

	return new CoberturaModal();
})

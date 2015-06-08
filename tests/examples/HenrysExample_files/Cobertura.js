define(function(require) {
	var Geolocate 		= require('Geolocation/Geolocate');
	var EnCobertura 	= require('Geolocation/EnCobertura');
	var Storage			= require('Utils/Storage');
	var Selector 		= require('Utils/Selector');
	var Format 			= require('Utils/Format');
	var SelfLocation 	= require('Tools/SelfLocation');
	var GeoSession		= require('Geolocation/GeoSession');

	function Cobertura() {
		if($('.address-search').length == 0) return;

		var tengoCobertura 	= 0;
		var geolocating 	= false;

		//var user_address = Storage.value('user_address')
		var lastGeoAddress = Storage.value('geo_address') || false;
		if( lastGeoAddress !== false ) lastGeoAddress = JSON.parse( lastGeoAddress );

		if(typeof lastGeoAddress === 'object'
			&& 'lat' in lastGeoAddress
			&& 'lng' in lastGeoAddress && lastGeoAddress.lat != null && lastGeoAddress.lng != null) {
			// Busco inmediatamente ya que tengo los datos de GEO pasados..
			// checkCoverage(lastGeoAddress);
		}

		if($('.address-search .visible').length == 0) {
			$('.address-search .verify').addClass('visible');
		}

		// Bind al click en verificar.. (siempre)
		new Geolocate('.address-search form', function(response) {
			if(geolocating) return false;
			geolocating = true;

			// Esta fucncion se llama cuando se geolocalizó lo que el usuario hizo
			if(response) {
				Storage.value('geo_address', JSON.stringify(response));
				// Verificar cobertura
				new GeoSession(response, function() {
					checkCoverage(response);
				});
			} else {
				// Abrir mapa
				SelfLocation.show(function(lat, lng, address) {
					if(lat === false) {
						geolocating = false;
						$('.address-search .button').removeClass('loading');
						return false;
					}

					var response = {search: {address: address}, lat: lat, lng: lng};

					new GeoSession(response, function() {
						Storage.value('geo_address', JSON.stringify(response));
						checkCoverage(response);
					});
				})
			}
		})

		// Ir a buscar cobertura
		// addressSearch.addClass('result')
		$('.address-search .button.black').click(function() {
			$('.address-search .visible').removeClass('visible')
			$('.address-search .verify').addClass('visible')
			$('.address-search').removeClass('result')
		})

		function checkCoverage(geo) {
			new EnCobertura(establecimiento_id, geo, function(data) {
				$('.address-search .button').removeClass('loading');

				if(data && data.response && 'redireccionar' in data) {
					//if(app.embed) data.redireccionar = '/embed' + data.redireccionar;
					if(data.redireccionar.indexOf('?') !== -1) data.redireccionar = data.redireccionar.split('?')[0];

					window.location.href = data.redireccionar;
					return false;
				}

				if(data) {
					$('.address-search').addClass('result');
					$('.address-search .visible').removeClass('visible');

					// Mostrar la vista que corresponda según la respuesta de cobertura del servidor..
					if(data.response !== false) {
						// Se actualizan las variables en el perfil...
						window.min_order 		 = parseInt(data.response.pedido_minimo);
						window.funcion_domicilio = data.response.funcion_domicilio;

						var texto_funcion_domicilio = (window.funcion_domicilio == null) ? '' : data.response.funcion_domicilio.split('|')[0];

						$('.funcion-view').text(texto_funcion_domicilio);
						$('.address-search .success').addClass('visible');
						$('.address-search .success .h3 span.inner').text(geo.search.address);
					} else {
						// No cubre..
						$('.address-search .error').addClass('visible');
					}
				}

				geolocating = false
			});
		}
	}

	return Cobertura;
})

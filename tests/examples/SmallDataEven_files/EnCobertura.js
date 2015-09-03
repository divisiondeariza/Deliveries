define(function(require) {
	// Busca si un resultado de Geolocate está en cobertura con un restaurante dado
	var Storage		= require('Utils/Storage');
	var Network 	= require('Utils/Network');
		Network		= new Network();

	// Set de variables
	window.haveAddress    = (app.Address && app.Address != 'null') ? true : false;
	window.tengoCobertura = 0;
	
	function EnCobertura(establecimiento_id, geo, callback) {
		var api = app.url_api + 'en_cobertura/{{address}}/' + establecimiento_id + '/{{lat}}/{{lng}}';

		if(!('search' in geo)) return;
			
		var url = api;
			url = url.replace('{{address}}', escape(geo.search.address));
			url = url.replace('{{lat}}', geo.lat);
			url = url.replace('{{lng}}', geo.lng);

		// Envia al server todo lo que empiece por dir en los campos del form
		var address_form = {};
		for(var i in geo.form) {
			if(i.indexOf('dir') > -1) {
				address_form[i] = geo.form[i];
			}
		}

		// Actualiza las opciones del header con lo que se puso acá:
		for(var i in address_form) {
			$('*[name="' + i + '"]').value(address_form[i]);
		}

		$('*[name="lat"]').value(geo.lat);
		$('*[name="lng"]').value(geo.lng);

		Network.post(url, {address_form: address_form}, function(data) {
			if(data) {
				data = JSON.parse(data);

				// Mostrar la vista que corresponda según la respuesta de cobertura del servidor..
				if(data.response !== false) {
					window.tengoCobertura = 1;
				} else {
					window.tengoCobertura = -1;
				}

				if(callback && typeof callback == 'function') {
					callback(data);
					callback = null;
				}
			}
		})
	}

	return EnCobertura;
});
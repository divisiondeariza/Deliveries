/*
	Este código le envía al servidor el address que el usuario obtuvo para guardarlo en sesión
	con eso cuando recargue ya lo tiene allí.
*/

define(function(require) {
	var Network 	= require('Utils/Network');
		Network 	= new Network();

	function GeoSession(data, callback) {
		if('form' in data) delete data.form.lat;
		if('form' in data) delete data.form.lng;
		
		var data = $.extend({}, data, data.form);
		Network.post(app.url_api + 'geosession', {session: JSON.stringify(data)}, callback);
	}

	return GeoSession;
})
/*
	Network
	
	Implementa comunicación via HTTP con el servidor, devuelve el texto plano con el resultado
	
	Network.get(url, get_query, function callback() {})
*/
define(function(require) {
	var HttpRequest = require('Utils/HttpRequest')
	
	function Network() {}

	Network.prototype = {
		get: function(url, data, callback) {
			// Agrega la info del data a la url
			url += '?' + serializeQuery(data)
			var http = new HttpRequest(url, callback)
				http.events(this.events)

			return http.start()
		},
		post: function(url, data, callback) {
			var http = new HttpRequest(url, callback, data)
				http.events(this.events)

			return http.start()
		},
		on: function(event, callback) {
			this.events[event] = callback
			return this
		},
		events: {
			start: function() {},
			end: function() {}
		}
	}

	function serializeQuery(data) {
		var serialize = []
		for(var i in data) {
			serialize.push(i + '=' + data[i])
		}
		return serialize.join('&')
	}

	return Network
})
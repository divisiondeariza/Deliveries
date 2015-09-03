define(function() {
	function HttpRequest(url, callback, postData) {
		this.init(url, callback, postData)
	}

	HttpRequest.prototype = {
		req: null,
		trigger_events: {},
		callback: null,
		postData: null,
		init: function(url, callback, postData) {
			this.postData = postData || false

			this.callback = callback
			this.req = createXMLHTTPObject()
		    if (!this.req) return

			var events = null
		    var method = (postData) ? "POST" : "GET"

		    this.req.open(method, url,true)
		    //this. req.setRequestHeader('User-Agent','XMLHTTP/1.0')

		    if (this.postData) {
		        this.req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		    }

		    var _self = this
		    this.req.onreadystatechange = function () {
		        if (_self.req.readyState != 4) return;
		        if (_self.req.status != 200 && _self.req.status != 304) {
					//  ERROR
		            return;
		        }

		        if('end' in _self.trigger_events) {
		        	_self.trigger_events.end()
		        }

		        _self.callback(
		        	_self.req.responseText
		        )
		    }
		},
		events: function(e) {
		    this.trigger_events = e
		},
		start: function() {
		    if('start' in this.trigger_events) {
		    	this.trigger_events.start();
		    }

		   	this.req.send(serializeArray(this.postData))
		}
	}

	var XMLHttpFactories = [
	    function () {return new XMLHttpRequest()},
	    function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	    function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	    function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	]

	function createXMLHTTPObject() {
	    var xmlhttp = false;
	    for (var i=0;i<XMLHttpFactories.length;i++) {
	        try {
	            xmlhttp = XMLHttpFactories[i]();
	        }
	        catch (e) {
	            continue;
	        }
	        break;
	    }
	    return xmlhttp
	}

	function serializeArray(obj, inner) {
		var inner = inner || false 
		var parts = []

		for(var i in obj) {
			if(typeof obj[i] == 'object' && obj[i] != null) {
				parts = parts.concat(serializeArray(obj[i], i))
			} else {
				parts.push('data[' + ((inner) ? inner + '][' : '') + i +']=' + obj[i]);
			}
		}

		return parts.join('&')
	}

	return HttpRequest
})
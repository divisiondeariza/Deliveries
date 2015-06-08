if(!window.lib) window.lib = {};
lib.geolocation = function() {

	var sandbox = null;
	var responses = {};
	var search_all = false,
	search = {}, timeouts = {},
	timeout = { interval : null, time : 1000, max_time : 10000 },
	ignore_results = false, // If true, will ignore any result from callback or ajax (this is to avoid timeoud requests coming later)
	force_check = false, // Will check even if some services do not have an anwser (asume false for those)
	init_lat = '-83.2146529',
	init_lng = '-103.4239905',
	single_search = null
	lastResponse = null;

	var trigger_event = 'geocode_result';

	var geocode_services = {
		google: {
			name: 'google',
			url: 'http://maps.googleapis.com/maps/api/geocode/json?address={search_address}&sensor=false',
			type: 'json'
		},
		yahoo: {
			name: 'yahoo',
			url: 'https://sgws2.maps.yahoo.com/FindLocation?appid=ymapsaura2&q={search_address}&gflags=A&flags=JXT&locale=es-US&callback=lib.geolocation.callback.yahoo',
			type: 'jsonp'
		},
		bing: {
			name: 'bing',
			url: 'http://www.bing.com/maps/search.ashx?q=&wh=%22{search_address}%22&n=11&mkt=%22es-es%22&cp=%224.599999903999986%2C-74.083297729%22&si=0&ob=&r=80&md=%221224%2C431%22&z=6&qh=%22st%22&ep=&oj=&ai=%22eal%22&ca=&cid=&jsonso=r10&jsonp=lib.geolocation.callback.bing&culture=%22es-es%22&token=AvXOkJ2GHFCrJbQe80XG5RRJXwJN6puZNJVSkDIh4jiwX3tjFXUtAum2_c61461B',
			type: 'jsonp'
		},
		clickdelivery: {
			name: 'clickdelivery',
			url: '/api/1.0/location?{json}&search={address}',
			type: 'json'
		}
	};

	var standarize_results = {
		google: function(result) {
			timeouts['google']['response'] = true
			var result = result[1]

			var response = {
				readable: result.results[0].formatted_address
			};

			address_components = result.results[0].address_components
			for(var i in address_components) {
				type = address_components[i].types[0];

				value_long = address_components[i].long_name;
				value = address_components[i].short_name;

				switch(type) {
					case 'country':
						response.country_code = value;
						response.country = value_long;
					break;
					case 'administrative_area_level_1':
						response.county = value;
					break;
					case 'locality':
						response.city = value;
					break;
				}
			}

			response.lat = result.results[0].geometry.location.lat;
			response.lng = result.results[0].geometry.location.lng;

			return response;
		},
		yahoo: function(result) {
			timeouts['yahoo']['response'] = true;
			var result = result[1]

			if(!('Result' in result.ResultSet)) return false
			if('latitude' in result.ResultSet.Result) {
				response = { readable: [	result.ResultSet.Result.line1,
												result.ResultSet.Result.line2,
												result.ResultSet.Result.line3,
												result.ResultSet.Result.line4	 ].join(', '),
								 country_code: 	result.ResultSet.Result.countrycode,
								 country: 		result.ResultSet.Result.country,
								 city: 			result.ResultSet.Result.city,
								 county: 		result.ResultSet.Result.county,
								 lat: parseFloat(result.ResultSet.Result.latitude),
								 lng: parseFloat(result.ResultSet.Result.longitude) }
			} else {
				response = { readable: [	result.ResultSet.Result[0].line1,
												result.ResultSet.Result[0].line2,
												result.ResultSet.Result[0].line3,
												result.ResultSet.Result[0].line4	].join(', ') ,
								 country_code: 	result.ResultSet.Result[0].countrycode,
								 country: 		result.ResultSet.Result[0].country,
								 city:			result.ResultSet.Result[0].city,
								 county: 		result.ResultSet.Result[0].county,
								 lat: parseFloat(result.ResultSet.Result[0].latitude),
								 lng: parseFloat(result.ResultSet.Result[0].longitude)	}
			}

			return response;
		},
		bing: function(result) {
			timeouts['bing']['response'] = true
			var result = result[1] // first argument contains results

			if(result.primary.ResultSets != null && result.primary.ResultSets.length) {
				if(result.primary.ResultSets[0].ListingType == 'Unknown') response = false
				else {
					result   = result.primary.ResultSets[0].SearchRegion.GeocodeLocation
					response = { readable: result.DisplayName,
								 country_code: 	result.Address.CountryRegion,
								 country: 		result.Address.CountryRegion,
								 city:			result.Address.Locality,
								 county: 		result.Address.AdminDistrict,
								 lat: parseFloat(result.Locations[0].Latitude),
								 lng: parseFloat(result.Locations[0].Longitude)	}
				}
			} else response = false;

			return response;
		},
		clickdelivery: function(result) {
			timeouts['clickdelivery']['response'] = true;
			var result = result[1] // first argument contains results

			if(result.status == false) return false;
			var response = {
				readable: 		('readable' in result) ? result.readable : ('query' in result) ? result.query.readable : null,
				country_code: 	result.country_code,
				country: 		('country' in result) ? result.country : ('query' in result) ? result.query.country : null,
				city:			('city' in result)    ? result.city    : ('query' in result) ? result.query.city : null,
				county: 		('county' in result)  ? result.county  : ('query' in result) ? result.query.county : null,
				lat: parseFloat(result.lat),
				lng: parseFloat(result.lng)
			};

			return response;
		}
	}

	var callback = {
		yahoo: function(response) {
			processResult('yahoo', response)
		},
		bing: function(response, x) {
			processResult('bing', response)
		}
	}

	function init() {
		if(arguments[0]) trigger_event = arguments[0]
	}

	function getJSON(url, fn) {
		var request = new XMLHttpRequest()

		request.open('GET', url, true)
		request.onreadystatechange = function () {
			if (request.readyState == 4 ) {
				if(request.status != 200) {
					try {
						fn( false )
					} catch(e) {}
				} else {
					try {
						fn( JSON.parse(request.responseText) )
					} catch(e) {}
				}
			}
		}

		request.send()
		return request;
	}

	function getScript(src) {
	    var head = document.getElementsByTagName("head")[0]
		var js = document.createElement("script")
			js.type = "text/javascript"
			js.src = src

		head.appendChild(js)
	}

	function validDomain() {
		var check_d1 = '646f6d6963696c696f73',
			check_d2 = '6c696d6164656c6976657279';
		var domain = window.location.hostname
		return (domain.indexOf(check(check_d1)) >= 0 || domain.indexOf(check(check_d2)) >= 0)
	}

	function check(s) {
	    var str = '';
	    for (var i = 0; i < s.length; i += 2) {
	        var v = parseInt(s.substr(i, 2), 16);
	        if (v) str += String.fromCharCode(v);
	    }
	    return str;
	}

	// If service is not set, will try with all of them
	// params:
	// @string address; @string service
	function geocode() {
		//if(!validDomain()) return false;
		// clears previous response
		search = arguments[0]
		responses = {}
		ignore_results = false // reset
		force_check = false // reset

		service = (arguments[1]) ? arguments[1] : false
		search_all = false; // reset
		timeouts = {}; //google: {}, bing: {}, yahoo: {}} // reset

		if(service === false) {
			search_all = true;
			for(var service in geocode_services) {
				if(service === 'clickdelivery') continue;
				request(service, search)
			}
		} else {
			var services = service.split(',');
			if(services.length === 1) {
				single_search = service;
				request(service, search)
			} else {
				for(var i = 0; i < services.length; i++) {
					request(services[i], search)
				}
			}
		}

		timeout.interval = setInterval(checkTimeouts, timeout.time)
	}

	function buildAddress() {
		return removeDiacritics( [search.address, search.city, search.county, search.country].join(', ') )
	}

	/*
	 *	This function checks if the services timedout
	 *
	 */
	function checkTimeouts() {
		var currentTime = new Date().getTime()
		var total_timeouts = 0;
		var services_responded = 0;

		for(var service in timeouts) {
			if(!('response' in timeouts[service])) continue;

			if(timeouts[service].response) {
				services_responded++;
			} else if(timeouts[service].timedout) {
				total_timeouts++;
			} else {
				var time = timeouts[service].time
				if( (currentTime - time) > timeout.max_time ) {
					timeouts[service].timedout = true
					total_timeouts++
				}
			}
		}

		// Todos hicieron timeout
		if(total_timeouts == size(timeouts)) {
			clearInterval(timeout.interval);
			timeouts = {};

			ignore_results = true // do not accept any response after this.
			// Response is false since everything failed
			ev = document.createEvent('Event')
			ev.initEvent(trigger_event, false, false, false)
			ev.detail = false;

			window.dispatchEvent(ev)
		} else if(
			(services_responded == size(timeouts)) ||
			(total_timeouts > 0 && total_timeouts+services_responded) == size(timeouts) ) {
			// todos respondieron o algunos hicieron timeout

			force_check = true;
			ignore_results = true;
			clearInterval(timeout.interval);
			timeouts = {};

			checkResult();
		}
	}

	function request(service, search_input) {
		search = search_input
		address = buildAddress()
		search.search_address = address

		if(service in geocode_services) {
			service_name = service;
			service = geocode_services[service];
			switch(service.type) {
				case 'json':
					var host = '';

					if(service_name === 'clickdelivery') {
						host = 'http://www.domiciliosbogota.com';
					}

					getJSON(host + format(service.url, search), function(result) {
						processResult(service.name, result)
					})
				break;
				case 'jsonp':
					getScript(format(service.url, search)) // this will trigger a callback
				break;
				case 'ajax':
					// Aún no probado
				break;
			}

			timeouts[service_name] = {}
			timeouts[service_name].time = new Date().getTime()
			timeouts[service_name].timedout = false
			timeouts[service_name].response = false
		} else console.log('lib.geocode.request service not available')
	}

	function processResult() {
		if(ignore_results) return false

		if(	arguments[0] ) {
			responses[arguments[0]] = standarize_results[arguments[0]](arguments);
		}

		checkResult()
	}

	function checkResult() {
		var clear = false;
		// If we're checking all of them, and already got them all, then look for the winner
		if(size(responses) > 1 && ( (size(responses) == (size(geocode_services)-1) && search_all) || force_check )) {
			var best = bestGeocode(responses);
			var ev = document.createEvent('Event');
				ev.initEvent(trigger_event, false, false, best);
				ev.detail = best;

			lastResponse = best;

			window.dispatchEvent(ev) // triggers the result
			clear = true;
		} else if(search_all === false && single_search || force_check) {
			var ev = document.createEvent('Event');
				ev.initEvent(trigger_event, false, false, responses[single_search]);
				ev.detail = responses[single_search];

			lastResponse = responses[single_search];

			window.dispatchEvent(ev) // triggers the result
			clear = true;
		}

		if(clear) {
			force_check = false;
			search_all = false;
			responses = {};
			timeouts = {};
			clearInterval(timeout.interval);
		}
	}

	// Devuelve un elemento del DOM
	function q(selector) {
		if(typeof(document.querySelector) != 'undefined'){
		  el = document.querySelector(selector)
		} else {
			switch(selector.charAt(x)) {
				case '.':
					el = document.getElementsByClassName(selector)[0]
				break;
				case '#':
					el = document.getElementById(selector.substring(1))
				break;
				default:
					el = document.getElementsByName(selector)[0]
				break;
			}
		}

		return el
	}

	// Hace el replace de los valores en el url
	function format(url, search) {
		for(var key in search) {
			url = url.replace(new RegExp('\{' + key + '\}', 'g'), escape(search[key].replace(/%20/g, ' ')));
		}

		if(url.indexOf('{json}') >= 0) {
			url = url.replace(/\{json\}/g, objectToQuery(search));
		}

		return url;
	};

	function removeDiacritics(a) { for(var b=[{base:"A",letters:/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},{base:"AA",letters:/[\uA732]/g},{base:"AE",letters:/[\u00C6\u01FC\u01E2]/g},{base:"AO",letters:/[\uA734]/g},{base:"AU",letters:/[\uA736]/g},{base:"AV",letters:/[\uA738\uA73A]/g},{base:"AY",letters:/[\uA73C]/g},{base:"B",letters:/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},{base:"C",letters:/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},{base:"D",letters:/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},{base:"DZ",letters:/[\u01F1\u01C4]/g},{base:"Dz",letters:/[\u01F2\u01C5]/g},{base:"E",letters:/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},{base:"F",letters:/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},{base:"G",letters:/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},{base:"H",letters:/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},{base:"I",letters:/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},{base:"J",letters:/[\u004A\u24BF\uFF2A\u0134\u0248]/g},{base:"K",letters:/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},{base:"L",letters:/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},{base:"LJ",letters:/[\u01C7]/g},{base:"Lj",letters:/[\u01C8]/g},{base:"M",letters:/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},{base:"N",letters:/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},{base:"NJ",letters:/[\u01CA]/g},{base:"Nj",letters:/[\u01CB]/g},{base:"O",letters:/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},{base:"OI",letters:/[\u01A2]/g},{base:"OO",letters:/[\uA74E]/g},{base:"OU",letters:/[\u0222]/g},{base:"P",letters:/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},{base:"Q",letters:/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},{base:"R",letters:/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},{base:"S",letters:/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},{base:"T",letters:/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},{base:"TZ",letters:/[\uA728]/g},{base:"U",letters:/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},{base:"V",letters:/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},{base:"VY",letters:/[\uA760]/g},{base:"W",letters:/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},{base:"X",letters:/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},{base:"Y",letters:/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},{base:"Z",letters:/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},{base:"a",letters:/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},{base:"aa",letters:/[\uA733]/g},{base:"ae",letters:/[\u00E6\u01FD\u01E3]/g},{base:"ao",letters:/[\uA735]/g},{base:"au",letters:/[\uA737]/g},{base:"av",letters:/[\uA739\uA73B]/g},{base:"ay",letters:/[\uA73D]/g},{base:"b",letters:/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},{base:"c",letters:/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},{base:"d",letters:/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},{base:"dz",letters:/[\u01F3\u01C6]/g},{base:"e",letters:/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},{base:"f",letters:/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},{base:"g",letters:/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},{base:"h",letters:/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},{base:"hv",letters:/[\u0195]/g},{base:"i",letters:/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},{base:"j",letters:/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},{base:"k",letters:/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},{base:"l",letters:/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},{base:"lj",letters:/[\u01C9]/g},{base:"m",letters:/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},{base:"n",letters:/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},{base:"nj",letters:/[\u01CC]/g},{base:"o",letters:/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},{base:"oi",letters:/[\u01A3]/g},{base:"ou",letters:/[\u0223]/g},{base:"oo",letters:/[\uA74F]/g},{base:"p",letters:/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},{base:"q",letters:/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},{base:"r",letters:/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},{base:"s",letters:/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},{base:"t",letters:/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},{base:"tz",letters:/[\uA729]/g},{base:"u",letters:/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},{base:"v",letters:/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},{base:"vy",letters:/[\uA761]/g},{base:"w",letters:/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},{base:"x",letters:/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},{base:"y",letters:/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},{base:"z",letters:/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}],c=0;c<b.length;c++)a=a.replace(b[c].letters,b[c].base);return a}

	function size(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	/*
	 *	this function is basically what makes this awesome,
	 *	given multiple results, we try to find wich one is the best
	 *	for geocoding the address, if none of them are able to find a
	 *	good point, then we return false

	 *	the process to finding how good a result is goes as follows:
	 *	-	Is in the correct country (by name or country_code)
	 *  -	Is in the correct city, if we have that
	 *	-	The number of matchs on the address we got is over than the 35%
	 * 	for each correct we give 1 point, and the more matchs gives more points
	 *	at the end the service with more matchs wins.
	 */
	function bestGeocode( results ) {
		for(var service in results) {
			if(results[service]) {
				result = results[service],
				score = 0,
				corrects = [],
				ignore = false;

				// Correct country?
				if( 'country' in result && match_word(result.country, search.country) ) 	{
					corrects.push('country')
					//score += 1
				} else ignore = true

				// Correct city?
				if(	'city' in result && match_word(result.city, search.city) ) 	{
					corrects.push('city')
					//score += 1
				} else ignore = true
				// Correct county?
				if(	'county' in result && match_word(result.county, search.county) ) {
					corrects.push('county')
					//score += 1
				} else ignore = true

				match_address = removeManyWords(result.readable, [search.country, search.city, search.county]);
				match_address = cleanAddress(match_address);

				address_match = matchPhrases(match_address, unescape(search.address));
				score += address_match.matchs;

				results[service].score = (ignore) ? 0 : score;
			}
		}

		winner = false
		for(var i in results) {
			if(results[i].score > 0 && ( winner == false || results[i].score > winner.score )) {
				winner = results[i]
			}
		}

		return winner // returns the result
	}

	function match_word(word, vs) {
		return ( trim(removeDiacritics(word.toLowerCase())) == trim(removeDiacritics(vs.toLowerCase())) )
	}

	function removeManyWords(phrase, words) {
		phrase = removeDiacritics( phrase.toLowerCase() )
		for(var i in words) {
			phrase = phrase.replace(trim(removeDiacritics(words[i].toLowerCase())), '')
		}
		return phrase;
	}

	function cleanAddress(address) {
		return address.replace(/[^\w\s]/g,'');
	}

	function trim(x) {
		return x.replace(/^\s+|\s+$/gm,'');
	}

	// Returns the number of matchs of each  word in a  string against to
	function matchPhrases(string, to) {
		to = trim(removeDiacritics(to.toLowerCase()))
		string = trim(removeDiacritics(string.toLowerCase()))

		var parts = to.split(' ')
		var match_to_parts = string.split(' ')
		var match_to = []

		for(var i in match_to_parts) {
			if(match_to_parts[i] == '') continue
			match_to.push( removeDiacritics(match_to_parts[i]) )
		}

		matchs = 0
		for (var i in parts) {
			if(parts[i] == '') continue;

			part = removeDiacritics(parts[i])
			if( match_to.indexOf(part) > -1) matchs ++
		}

		return {matchs: matchs, matchs_to: match_to.length}
	}

	/** AJAX requests **/
	var ajaxTimeout = null;

	function ajaxRequest(url, data, success, error) {
		var params = objectToQuery(data);

		var HttpClient =  new XMLHttpRequest()
		//HttpClient.timeout = 45000

		HttpClient.addEventListener("load", function(e) {
			// Procesar response
			success(HttpClient.responseText)
		}, false);

		HttpClient.addEventListener("error", function(e) {
			error();
		}, false);

		HttpClient.addEventListener("abort", function() {
			error();
		}, false);

		HttpClient.open('POST', url, true);
		//Send the proper header information along with the request
		HttpClient.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		HttpClient.setRequestHeader("Origin", "http://www.sitimapa.com/");

		ajaxTimeout = setTimeout(function () {
			HttpClient.abort();
			error();
		}, 45000);

		HttpClient.send(params)
	}

	function objectToQuery(data, prefix) {
		var prefix = prefix || false;
		var query = [];

		for ( var i in data ) {
			var indice = i;
			if(prefix) {
				if(typeof i == 'number' || i%1 === 0) {
					indice = prefix + '[]';
				} else {
					indice = prefix + '[' + indice + ']';
				}
			}

			if ( typeof data[i] == 'object' ) {
				query.push(objectToQuery(data[i], i).join('&'));
			} else {
				query.push(indice + '=' + escape(data[i]))
			}
		}

		if(prefix) return query;
		return query.join('&')
	}


	return {
		init: init,
		geocode: geocode,
		callback: callback,
		result: function() { return lastResponse }
	}
}();

/*
	Esta funcion se encarga de convertir los campos de un search y devolver un objeto listo para pasarle
	a la librería de geolocalización

	Recibe los parámetros:
		campos: Object { name: value, ...}
		structure: Object

*/

function geoconverter(campos, structure) {
	var structure = JSON.parse(JSON.stringify(structure))

	for(var key in campos) {
		var value = campos[key];
		for(var keys in structure) {
			structure[keys] = unescape(replace(structure[keys], key, value));
		}
	}

	return structure;
}

function geoconverteriOS(campos, structure) {
	var structure = geoconverter(campos ,structure);

	lib.geolocation.init('geocode_result')
	lib.geolocation.geocode(structure, structure.method);
}

function replace(str, key, value) {
	return str.replace('{{' + key + '}}', escape(value))
}

// https://code.google.com/p/xmlhttprequest/
(function(m,u,n,g,e,d){for(g=u[d[31]]-1;g>=0;g--)n+=e[d[67]][d[72]](u[d[73]](g)-1);u=n[d[71]](' ');for(g=u[d[31]]-1;g>=0;g--)m=m[d[70]](e[d[69]](g%10+(e[d[67]][d[72]](122-e[d[68]][d[74]](g/10))),'g'),u[g]);e[d[3]]('_','$',m)(d,d[46])})("(9z 2w{8y u=6x7x128x;8y b=7w6x7x238x,c=6x7x268x7x168x3w!6x7x438x,d=c3w6x7x348x7x638x7x338x(/MSIE ([\\.0-9]+)/)3wRegExp.$16w7;9z f2w{5x.f=u3w!d?2y u:2y 6x7x08x(_[7]);5x.e=0w};0y(b3wu7x658x)f7x658x=u7x658x;f7x98x=0;f7x88x=1;f7x48x=2;f7x58x=3;f7x28x=4;f9x7x488x=f7x98x;f9x7x518x='';f9x7x528x=2x;f9x7x578x=0;f9x7x588x='';f9x7x398x=2x;f7x398x=2x;f7x388x=2x;f7x408x=2x;f7x378x=2x;f9x7x428x=9z(v,z,a,A,x){6z 5x.d;0y(4x7x318x<3)a=3x;5x.c=a;8y t=5x,n=5x7x488x,j;0y(c3wa){j=9z2w{0y(n9wf7x28x){g(t);t7x148x2w}};6x7x208x(_[41],j)}0y(f7x388x)f7x388x7x188x(5x,4x);0y(4x7x318x>4)5x.f7x428x(v,z,a,A,x);7z 0y(4x7x318x>3)5x.f7x428x(v,z,a,A);7z 5x.f7x428x(v,z,a);0y(!b3w!c){5x7x488x=f7x88x;k(5x)}5x.f7x398x=9z2w{0y(b3w!a)3y;t7x488x=t.f7x488x;l(t);0y(t.b){t7x488x=f7x98x;3y}0y(t7x488x6wf7x28x){g(t);0y(c3wa)6x7x248x(_[41],j)}0y(n9wt7x488x)k(t);n=t7x488x}};f9x7x538x=9z(C){0y(f7x408x)f7x408x7x188x(5x,4x);0y(C3wC7x358x){C=6x7x138x?2y 6x7x138x2w7x548x(C):C7x668x;0y(!5x.d7x18x)5x.f7x558x(_[1],_[17])}5x.f7x538x(C);0y(b3w!5x.c){5x7x488x=f7x88x;l(5x);9y(5x7x488x<f7x28x){5x7x488x2v;k(5x);0y(5x.b)3y}}};f9x7x148x=9z2w{0y(f7x378x)f7x378x7x188x(5x,4x);0y(5x7x488x>f7x98x)5x.b=3x;5x.f7x148x2w;g(5x)};f9x7x288x=9z2w{3y 5x.f7x288x2w};f9x7x298x=9z(w){3y 5x.f7x298x(w)};f9x7x558x=9z(w,B){0y(!5x.d)5x.d=1w;5x.d[w]=B;3y 5x.f7x558x(w,B)};f9x7x158x=9z(w,i,e){8z(8y m=0,s;s=5x.e[m];m2v)0y(s[0]6ww3ws[1]6wi3ws[2]6we)3y;5x.e7x478x([w,i,e])};f9x7x508x=9z(w,i,e){8z(8y m=0,s;s=5x.e[m];m2v)0y(s[0]6ww3ws[1]6wi3ws[2]6we)1z;0y(s)5x.e7x568x(m,1)};f9x7x258x=9z(q){8y r={'type':q7x628x,'target':5x,'currentTarget':5x,'eventPhase':2,'bubbles':q7x218x,'cancelable':q7x228x,'timeStamp':q7x608x,'stopPropagation':9z2w1w,'preventDefault':9z2w1w,'0zitEvent':9z2w1w};0y(r7x628x6w_[49]3w5x7x398x)(5x7x398x7x308x4w5x7x398x)7x188x(5x,[r]);8z(8y m=0,s;s=5x.e[m];m2v)0y(s[0]6wr7x628x3w!s[2])(s[1]7x308x4ws[1])7x188x(5x,[r])};f9x7x618x=9z2w{3y '['+_[36]+' '+_[12]+']'};f7x618x=9z2w{3y '['+_[12]+']'};9z k(t){0y(f7x398x)f7x398x7x188x(t);t7x258x({'type':_[49],'bubbles':1x,'cancelable':1x,'timeStamp':2y Date+0})};9z h(t){8y p=t7x528x,y=t7x518x;0y(c3wy3wp3w!p7x278x3wt7x298x(_[1])7x338x(/[^\\/]+\\/[^\\+]+\\+xml/)){p=2y 6x7x08x(_[6]);p7x198x=1x;p7x648x=1x;p7x328x(y)}0y(p)0y((c3wp7x448x9w0)4w!p7x278x4w(p7x278x3wp7x278x7x598x6w_[45]))3y 2x;3y p};9z l(t){7y{t7x518x=t.f7x518x}3z(e)1w7y{t7x528x=h(t.f)}3z(e)1w7y{t7x578x=t.f7x578x}3z(e)1w7y{t7x588x=t.f7x588x}3z(e)1w};9z g(t){t.f7x398x=2y 6x7x38x};0y(!6x7x38x9x7x188x){6x7x38x9x7x188x=9z(t,o){0y(!o)o=0w;t.a=5x;t.a(o[0],o[1],o[2],o[3],o[4]);6z t.a}};6x7x128x=f})2w;",">?!>=!..!,,!>.!>,!>\"!>>\"!\"\"!>>!>>>!}}!\'\'!*)!~|!^\\!^%\\!^^!\\`\\!xpeojx!tjiu!tuofnvhsb!fvsu!mmvo!ftmbg!iujx!fmjix!sbw!zsu!idujxt!gpfqzu!xpsiu!osvufs!xfo!gpfdobutoj!gj!opjudovg!spg!ftmf!fufmfe!umvbgfe!fvojuopd!idubd!ftbd!lbfsc!oj",'',0,this,'ActiveXObject Content-Type DONE Function HEADERS_RECEIVED LOADING Microsoft.XMLDOM Microsoft.XMLHTTP OPENED UNSENT XMLDOM XMLHTTP XMLHttpRequest XMLSerializer abort addEventListener all application/xml apply async attachEvent bubbles cancelable controllers detachEvent dispatchEvent document documentElement getAllResponseHeaders getResponseHeader handleEvent length loadXML match navigator nodeType object onabort onopen onreadystatechange onsend onunload open opera parseError parsererror prototype push readyState readystatechange removeEventListener responseText responseXML send serializeToString setRequestHeader splice status statusText tagName timeStamp toString type userAgent validateOnParse wrapped xml String Math RegExp replace split fromCharCode charCodeAt floor'.split(' '))

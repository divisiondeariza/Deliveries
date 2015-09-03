// https://maps.googleapis.com/maps/api/js?v=3&sensor=false&libraries=places

// Se pasa el selector al formulario que contiene el campo de búsqueda
// basados en el client_id realizamos la búsqueda de LatLng correspondiente

define(function(require) {
	var Autocomplete = require('Geolocation/Autocomplete');

	function Geolocate(selector, callback, bind) {
		this.init(selector, callback, bind)
	}

	Geolocate.prototype = {
		eventName: 'geocode_result',
		globalAddress: null,
		searchForm: null,
		searchFormEl: null,
		allowSubmit: false,
		lookup: false,
		selector: null,
		callback: function() {},
		init: function(selector, callback, bind) {
			this.selector = selector;
			// Set lib.geolocation.init con el eventName
			this.searchForm = $(selector);
			this.callback = callback;

			var _self = this;

			// Verifico si algún elemento del formulario utiliza autocomplete,
			// si es el caso, hago bind de las direcciones que selecciona el usuario para usarlas como
			// evento de geolocalización
			this.inputs = $(this.selector + ' input, ' + this.selector + ' select');
			this.googe_autocomplete = false;
			this.inputs.each(function(el) {
				if(this.getAttribute('google-autocomplete') && parseInt(this.getAttribute('google-autocomplete')) == 1) {
					this.google_autocomplete = true;

					var input = this;
					var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

			        function addEventListenerWrapper(type, listener) {
			            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
			            // and then trigger the original listener.
			            if (type == "keydown") {
			                var orig_listener = listener;
			                listener = function(event) {
			                    var suggestion_selected = $(".pac-item-selected").length > 0;
			                    if (event.which == 13 && !suggestion_selected) {
			                        var simulated_downarrow = $.Event("keydown", {
			                            keyCode: 40,
			                            which: 40
			                        });

			                        event.preventDefault();
			                        event.stopPropagation();

			                        orig_listener.apply(input, [simulated_downarrow]);
			                    }

			                    orig_listener.apply(input, [event]);
			                };
			            }

			            _addEventListener.apply(input, [type, listener]);
			        }

			        input.addEventListener = addEventListenerWrapper;
			        input.attachEvent = addEventListenerWrapper;

			        new Autocomplete(this, function(response) {
						_self.buildInputValues();
						response['search'] = geoconverter(_self.inputs_values, app.estructura_geolocalizacion);
						response['form'] = _self.inputs_values;
						_self.callback(response);
					}); // Agrega el autocomplete de google
				}
			})

			// Si bind llega como false, no corremos el query
			if(bind == undefined || bind === true ) {
				this.searchForm.on('submit', function(e) {
					e.preventDefault();
					if(this.getAttribute('allowsubmit')) {
						this.searchForm.find('.button').removeClass('loading');
					} else {
						//_self.searchForm.off();
						_self.formSubmit();
						return false;
					}

					return false;
				})
			}

			$(window).on(this.eventName, function(event) {
				if(_self.lookup === false) return false;

				_self.searchForm.find('.button').addClass('loading');
				_self.lookup = false;

				var response = event.detail;
				if(typeof response == 'undefined' || response === undefined) {
					response = lib.geolocation.result();
				}

				response['search'] = _self.globalAddress;
				response['form'] = _self.inputs_values;

				_self.callback(response);
			})

			return this
		},
		// Esta es la función que se encarga del geo basado en el client
		formSubmit: function() {
			this.searchForm.find('.button').addClass('loading');
			this.lookup = true;

			var errors = this.buildInputValues();

			if(errors) {
				this.searchForm.find('.button').removeClass('loading');
				return false;
			}

			this.globalAddress = geoconverter(this.inputs_values, app.estructura_geolocalizacion);

			if(this.globalAddress.address == null || this.globalAddress.address.length == 0) {
				this.searchForm.removeClass('loading');
				return false;
			}

			// Por defecto busca en todos
			var method = this.globalAddress.method;
				delete this.globalAddress.method;

			lib.geolocation.geocode(this.globalAddress, method);

			return false
		},
		buildInputValues: function() {
			this.inputs_values = {};
			var errors = false;
			// Construye el arreglo con los datos de los inputs
			for (var i = 0; i < this.inputs.length; i++) {
				input = this.inputs[i];

				type = input.getAttribute('type');

				if(input && input.tagName == 'SELECT') {
					input.options[input.selectedIndex].setAttribute('selected', 'selected')
				}

				input.classList.remove('error');

				if(type != 'hidden' && input.value == '') {
					input.classList.add('error');
					errors = true;
					break;
				}

				if(input && type != 'button') {
					this.inputs_values[input.getAttribute('name')] = input.value;
				}
			}

			return errors;
		}
	}


	return Geolocate;
})

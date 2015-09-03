define(function(require) {
	function SelfLocation() {
		return this.init()
	}

	SelfLocation.prototype = { 
		map: false,
		locationMarker: false,
		lat: null,
		lng: null,
		address_string: null,
		modal: null,
		overlay: null,
		btn: null,
		init: function() {
			this.modal = $('#selflocation-modal');
			this.btn = $('.verificar-cobertura-en-ubicacion');

			// Crea el elemento del overlay
			this.overlayEl = document.createElement('div')
			document.body.appendChild(this.overlayEl)

			this.overlay = $(this.overlayEl)

			var self = this;
			this.overlay.addClass('modal-overlay self-location')
					    .animEnd(function() {
					   		if(self.overlay.is('.fadeOut')) {
					   			self.overlay.removeClass('animated').hide()
					   		}
					   	}).on('click', function() {
					   		self.modal.find('.close').trigger('click')
					   	});
		},
		show: function(callback) {
			var addressModalText = $('#selflocation-modal .address p')

			if(!this.map) {
				// Centra el mapa basado en la ciudad que me encuentre
				// app.center debe ser igual a {lat: LATITUDE, lng: LONGITUDE}

				var options = { 
					center: new google.maps.LatLng(parseFloat(app.center[0]), parseFloat(app.center[1])),
					zoom: 14, 
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					//streetViewControl: false,
					mapMarker: false
				};

				this.map = new google.maps.Map(document.getElementById("self_map_canvas"), options);
				geocoder = new google.maps.Geocoder();
				
				this.lat = parseFloat(app.center[0]);
				this.lng = parseFloat(app.center[1]);

				var _self = this
				setTimeout(function() {
					_self.locationMarker = new google.maps.Marker({ position: new google.maps.LatLng(parseFloat(app.center[0]), parseFloat(app.center[1])),
															  map: _self.map, draggable:true, animation: google.maps.Animation.DROP,
															  icon: app.cobertura_ico });
					
					google.maps.event.addListener(_self.map, 'bounds_changed', function() {
					    _self.locationMarker.setPosition(_self.map.getCenter());
					});

					google.maps.event.addListener(_self.locationMarker, 'position_changed', function() {
						var newPos = _self.locationMarker.getPosition();
						
						_self.lat = newPos.lat()
						_self.lng = newPos.lng()

						geocoder.geocode( { 'latLng': newPos }, function(results, status) {
					    	if (status == google.maps.GeocoderStatus.OK) {
					       		if (results[0]) {
					       			_self.address_string = results[0].formatted_address;
					       			addressModalText.text( _self.address_string );

					       			if(addressModalText.css('opacity') == 0) {
					       				addressModalText.css('opacity', 1);
					       			}
					       		}	
					      	} 
					    });
					});
					
				}, 500);
			}

			var _self = this;

			this.modal.addClass('fadeIn animated')
			this.overlay.addClass('fadeIn animated')

			this.btn.click(function() {
				_self.modal.animEnd(function() {
			   		$(this).removeClass('animated fadeOut');
			   	}).removeClass('fadeIn').addClass('fadeOut')
				_self.overlay.animEnd(function() {
			   		$(this).removeClass('animated fadeOut');
			   	}).removeClass('fadeIn').addClass('fadeOut')

				callback(_self.lat, _self.lng, self.address_string);
			})

			this.modal.find('.close').click(function() {
				_self.modal.animEnd(function() {
			   		$(this).removeClass('animated fadeOut');
			   	}).removeClass('fadeIn').addClass('fadeOut')
				_self.overlay.animEnd(function() {
			   		$(this).removeClass('animated fadeOut');
			   	}).removeClass('fadeIn').addClass('fadeOut')

				callback(false);
			})
		}
	}; // SelfLocation.prototype

	return new SelfLocation()
})
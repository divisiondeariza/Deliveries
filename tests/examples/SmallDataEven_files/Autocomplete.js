define(function() {
	var autocomplete;

	// Bias the autocomplete object to the user's geographical location,
	// as supplied by the browser's 'navigator.geolocation' object.
	function geolocate() {
	  if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var geolocation = new google.maps.LatLng(
	          position.coords.latitude, position.coords.longitude);
	      var circle = new google.maps.Circle({
	        center: geolocation,
	        radius: position.coords.accuracy
	      });
	      autocomplete.setBounds(circle.getBounds());
	    });
	  }
	}

	function Autocomplete(element, callback) {
		// Create the autocomplete object, restricting the search
		// to geographical location types.
		var autocomplete = new google.maps.places.Autocomplete(
				/** @type {HTMLInputElement} */(element),
				{ types: ['geocode', 'establishment'] });

		//geolocate();
		// Utiliza el centro de la ciudad para los resultados del autocomplete
		var geolocation = new google.maps.LatLng(
				app.center[0], app.center[1]
		);

		var circle = new google.maps.Circle({
			center: geolocation,
			radius: 1000
		});

		autocomplete.setBounds(circle.getBounds());

		// When the user selects an address from the dropdown,
		// populate the address fields in the form.
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();
			var geometry = place.geometry.location;

			var response = {
				lat: geometry.lat(),
				lng: geometry.lng(),
				address: null
			};

			callback(response);
		});
	}

	return Autocomplete;
})

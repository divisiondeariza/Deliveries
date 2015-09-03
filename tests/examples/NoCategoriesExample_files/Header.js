define(function(require) {
	var Storage 		= require('Utils/Storage');
	var Geolocate 		= require('Geolocation/Geolocate');
	var Autocompletar 	= require('Tools/Autocompletar');
	var Login		= require('Tools/Login');
	var Sidebar		= require('Tools/Sidebar');
	var SelfLocation 	= require('Tools/SelfLocation');
	var Modal 		= require('Tools/Modal');

	function Header() {
		// * header->CambiarIdioma: Al cambiar el idioma, enviar el formulario

	  cambiarIdioma = $('#CambiarIdioma select');
	  if(cambiarIdioma.length) {
	    cambiarIdioma.on('change', function() {
				$(this).parents('form').submit();
			});
		}

		if($('.auto-modal').length) {
			// Despliega el auto-modal automáticamente:
			// * nota: estos modals son disposables.. se cierran y ya
			$('.auto-modal').each(function() {
				var modal = new Modal(
					$(this).attr('id') + 'Modal',
					{
						close: true,
						visible: true,
						inAnimation: 'bounceIn',
						outAnimation: 'fadeOut'
					}
				);

				modal.set('content', $(this).html()).show();
				$(this).remove();
			});
		}

		// * header->BuscarSearch: Implementa la función de autocompletar
		new Autocompletar().init();

		// * header->AddressSearch: Implementa el LatLng cuando se envía el buscar por dirección
		// 							si no se encuentra la dirección usa el Selflocation para que el usario se ubique
		new Geolocate('.buscar-form', function(response) {
			var form = $('.buscar-form');
			// Esta fucncion se llama cuando se geolocalizó lo que el usuario hizo
			if(response) {
				Storage.value('geo_address', JSON.stringify(response));

				form.find('input[name="readable"]').value(response.search.address);
				form.find('input[name="lat"]').value(response.lat);
				form.find('input[name="lng"]').value(response.lng);

				form.attr('allowsubmit', '1');
				form.off();
				form.submit();
			} else {
				// Abrir mapa
				SelfLocation.show(function(lat, lng, address) {
					if(lat === false) {
						// Canceló el mapa
						form.find('.button.loading').removeClass('loading');
						return false;
					}

					form.find('input[name="readable"]').value(address);
					form.find('input[name="lat"]').value(lat);
					form.find('input[name="lng"]').value(lng);

					form.attr('allowsubmit', '1');
					form.off();
					form.submit();
				})
			}
		})

		new Login();
		new Sidebar();

		// Implementa el botón de cambiar ciudad
		var cambiarCiudadBtn = $('.cambiar-ciudad');
		if(cambiarCiudadBtn.length) {
			var cambiarCiudadContainer = $('.cambiar-ciudad-nav');
			var cambiarCiudadCerrarBtn = $('.cambiar-ciudad-nav .cerrar-cambiar-ciudad');

			cambiarCiudadBtn.click(function() {
				cambiarCiudadContainer.toggleClass('show')
				cambiarCiudadBtn.find('span.asset').toggleClass('up')
			})

			cambiarCiudadCerrarBtn.click(function() {
				cambiarCiudadContainer.toggleClass('show')
				cambiarCiudadBtn.find('span.asset').toggleClass('up')
			})
		}

		// Implementa el botón de ayuda
		var ayudaBtn = $('.asset.mini-flecha-support');
		if(ayudaBtn.length) {
			var ayudaDropdown = $('.help-dropdown');

			ayudaBtn.click(function() {
			    event.stopPropagation();
			    ayudaDropdown.show();
					$('html').one('click', function() {
						//Hide the menus if visible
						ayudaDropdown.hide();
					});
			});

			// Implementa SnapEngage desde el dropdown de ayuda
			var snapBtn = $('.snap-engage');
			if(snapBtn.length) {
				snapBtn.click(function(e) {
					e.preventDefault()
					ayudaDropdown.toggleClass('show')
					window.autoOpenchat = false;
		    		if(SnapEngage.chatAvailable() === 1) {
			        	SnapEngage.openProactiveChat(true, false, '¿En qué puedo ayudarle?');
			        } else {
			        	SnapEngage.startLink()
			        }

			        return false
			    });
	    	}
	    }
	}

	return Header()
})

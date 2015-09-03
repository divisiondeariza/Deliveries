define(function(require) {
	var Slider 	= require('Tools/Slider');
	var CoberturaModal = require('Tools/CoberturaModal');

	var Modal 		= require('Tools/Modal');
	var Filtros   = require('Tools/Filtros');

	function Home() {
		var sugerirModal = false,
			targetUrl	 = null;

		if($('#sugerirModal').length > 0) {
			sugerirModal = new Modal('sugerirModal');
			sugerirModal.set('content', $('#sugerirModal').html());
			$('.sugerirModal .close-modal').click(function() {
				window.location.href = targetUrl;
			})
		}

		/* Limpio el formulario del header */
		$('#header-menu .buscar-form *').remove();
		$('#header-menu .buscar-form').attr('class', '')

		$('.results .button').each(function() {
			$(this).click(function() {
				$(this).addClass('loading')
			})
		})

		// Abre el formulario de GEO si no tengo
		$('.results a').click(function(e) {
			e.preventDefault();

			$(this).addClass('loading');
			targetUrl = $(this).attr('href');

			if(parseInt($(this).attr('data-pedidos')) == 0) {
				window.location.href = targetUrl;
				return false;
			}

			window.establecimiento_id = $(this).attr('data-id');

			/*if(CoberturaModal.conCobertura() === 0) {
				var _self = $(this);

				CoberturaModal.modalCobertura(function(data) {
					if(data.response === false) {
						// Muestro el modal de sugerencias para pedir
						_self.removeClass('loading');
						sugerirModal.show();
						return;
					}

					window.location.href = targetUrl;
				})

				return false;
			}*/

			window.location.href = targetUrl;
		})
		// ----------------------------------------

		new Slider('.slider');
		// Implementa el filtro por tipo en las listas de expand..
		new Filtros($('.expand-list li'), $('.results a'));

		// Implementa el click para expandir las listas
		$('.expand-list-btn').click( function() {
			var _target = $(this).attr('data-target');
			$(_target).toggleClass('open');
		});
	}

	return Home();
})

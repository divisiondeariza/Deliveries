define(function(require) {
	var Scroll      = require('Utils/Scroll');
	var Network 	= require('Utils/Network');
		Network 	= new Network();
		
	function Comentarios() {
		var li   	 = $('li.comentarios');
		var menu 	 = $('li.ver-menu');
		var menu_box = $('#menu-online');
		var comm_box = $('#comments');
		var comments  = $('#ul-comentarios');
		var template = $('#comment-template');
		var cur_page = 0;
		var loading  = false;

		// Si no tiene más de un comentario no me molesto en setear ver comentarios
		if(parseInt( li.attr('data-comentarios') ) > 0) {
			li.click(function() {
				menu.removeClass('active');
				li.addClass('active');

				menu_box.hide();
				comm_box.show('table');
				
				// Muestro la caja de comentarios y cargo los comentarios por ajax:
				if(cur_page === 0) {
					loadComments();
				}
			})

			menu.click(function() {
				menu.addClass('active');
				li.removeClass('active');

				menu_box.show('table');
				comm_box.hide();
			})
		} else {
			// Abro un modal que alerta al usuario que no hay comentarios..
		}

		// Infinite scroll:
		Scroll.add(function() {
			if(comm_box.is(':visible') === false || loading === true) return false;

			var box = comm_box.box();
			if(window.innerHeight > box.height && box.top < 0 
				|| box.top < 0 && ( window.innerHeight + ( box.top * -1 ) ) >= box.height) {
				// Cargar más comentarios..
				loadComments()
			}
		})
	
		function loadComments() {
			cur_page++;
			if(loading === true) {
				return false; // No hay más comentarios
			}
			$('#ul-comentarios').addClass('loading');
			loading = true;
			Network.post(app.url_api + 'comentarios', {id: establecimiento_id, page: cur_page}, function(data) {
				setTimeout(function() {
					loading = false;
					$('#ul-comentarios').removeClass('loading');
					data = JSON.parse(data);
					if(data.length) {
						for(var i in data) {
							var comentario = data[i];
							var html = template.html();

							// Imagen de comentario
							if(comentario.image == null) {
								comentario.image = '<span class="asset comment-default"></span>';
							} else {
								comentario.image = '<img src="' + comentario.image + '" />';
							}

							for(var part in comentario) {
								html = html.replace('{{' + part + '}}', comentario[part]);
							}

							comments.html(comments.html() + html);
						}
					} else {
						// Deja el loading como true dado que no se puede cargar más
						loading = true;
					}
				}, 1000)
			});
		}
	}

	return Comentarios;
})
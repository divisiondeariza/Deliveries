define(function(require) {
	var Network = require('Utils/Network');
		Network = new Network();
		
	var isArray = require('Utils/isArray');

	var autocompleteElement = null,
		resultsElement = null,
		pending = false;

	function Autocompletar() {
		var autocompleteElement = $('#BuscarSearch');
		var form = autocompleteElement.parents('form');

		Network.on('start', function() {
				form.addClass('loading');
				pending = true;
			 }).on('end', function() {
				form.removeClass('loading');
				pending = false;
			 });

		this.init = function() {
			// Deshabilita el autocomplete del input ->
			autocompleteElement.attr('autocomplete', 'off');
			// Agrega el elemento en el cual pondremos los resultados
			resultsElement = document.createElement('div');
			resultsElement.className = 'resultados';

			autocompleteElement.parent().append(resultsElement);
                        
			// Bind al elemento en el header
			autocompleteElement.on('keyup', function(e) {
				value = this.value;
				// Sí el texto es mayor a 3 letras, busco..
				if(value.length > 3 && !pending) {
					Network.get(app.url_autocompletar + '/' + escape(this.value), {}, function(response) {
						autocompletar = JSON.parse(response);
						mostrar( autocompletar ); // Muestro los resultados del autocompletar
					})
				}
			})
		}

		return this;
	}

	function mostrar( autocompletar ) {
		if(isArray(autocompletar) && autocompletar.length) {

			html = '<p class="small">' + language.view.autocompletar + '</p><ul>';
			for(var i in autocompletar) {
				resultado = autocompletar[i];
				html += '<li><a href="' + resultado.value + '">' + resultado.label + '</a></li>';
			}
			html += '</ul>';
			
			resultsElement.innerHTML = html;
		} else {
			resultsElement.innerHTML = '';
		}
	}

	return Autocompletar;
})
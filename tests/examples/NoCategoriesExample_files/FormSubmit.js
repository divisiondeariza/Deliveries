define(function(require) {
	// Esta funcion actúa como un _POST para enviar datos
	// a otra url pero utiliza un formulario, de esta forma
	// se puede enviar más data sin límites de URL (GET)

	function FormSubmit() {
		// Crea un formulario invisible para pasar datos
		var form = $('#FormSubmit')
		if(form.length == 0) {
			form = document.createElement('form')
			form.setAttribute('method', 'POST')
			form.setAttribute('accept-charset', 'utf-8')

			document.body.appendChild(form)
		} else form = form[0];


		// Llamar a esta función para enviar el formulario
		this.submit = function(url, data) {
			// Eliminamos cualquier input en este form
			var inputs = $('input', form);
			if(inputs.length > 0) {
				for(var i = 0; i < inputs.length; i++) {
					inputs[i].parentNode.removeChild(inputs[i]);
				}
			}

			// Creo los nuevos inputs con el data
			for(var i in data) {
				var newInput = document.createElement('input');
				newInput.setAttribute('type', 'hidden');
				newInput.setAttribute('name', i);
				newInput.value = (typeof data[i] == 'object') ? JSON.stringify(data[i]) : data[i];

				form.appendChild(newInput);
			}

			form.setAttribute('action', url);
			form.submit();
		} 

		return this;
	}

	return new FormSubmit();
})
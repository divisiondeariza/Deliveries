// Wrapper de la librería Persist para estandarizar
// su uso en toda la aplicación
// docs: https://github.com/jeremydurham/persist-js/blob/master/README.md

define(function(require) {
	var persist = new Persist.Store('clickdelivery-' + app.cliente_id)

	function Storage() {
		this.value = function(name, set) {
			value = null
			set = set || false

			if(set) { // Sets the value
				value = set
				persist.set(name, value)
			} else value = persist.get(name)

			return  value
		}

		this.remove = function(name) {
			return persit.remove(name)
		}
	}

	return new Storage()
})
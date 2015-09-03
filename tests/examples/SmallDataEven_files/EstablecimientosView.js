define(function(require) {
	var Cobertura = require('PedirOnline/Cobertura');
	var Menu	  = require('PedirOnline/Menu');
	var Carrito   = require('PedirOnline/Carrito');
	var Comentarios = require('PedirOnline/Comentarios');
	var BusquedaRapida = require('PedirOnline/BusquedaRapida');
	var LimitAdicionales = require('PedirOnline/LimitAdicionales');
	
	function EstablecimientosView() {
		// Inicializamos el carrito y el menú desde acá:
		Carrito  	= new Carrito();
		Cobertura 	= new Cobertura();
		Menu	 	= new Menu(Carrito);
		Comentarios = new Comentarios();
		BusquedaRapida = new BusquedaRapida();
		LimitAdicionales = new LimitAdicionales();
	}

	return EstablecimientosView()
})
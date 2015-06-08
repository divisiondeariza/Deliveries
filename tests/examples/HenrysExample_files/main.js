/*
 * Site logic for Clickdelivery websites
 */

require(['Controller', 'libs/persist.min', 'Tools/LazyLoad', 'libs/jquery.flipcountdown'],
	function (Controller, persistInclude, LazyLoad,flipcountdown) {

	LazyLoad.init();
	lib.geolocation.init();
	window.onbeforeunload = null;

	// Hace bind a las acciones que se usan en el header
	Controller('Header');

	/***************************
	*	 Controller Specific   *
	****************************/

	// Acciones que se realizar basados en el controller
	// y la acción actual. E.g: menú, carrito, home

	var controller = app.controller;
	var action 	   = app.action;

	switch(controller) {
		case 'promociones':
			Controller('Promociones')
		break;
		case 'buscar':
			switch (action) {
				case 'index':
					Controller('BuscarIndex');
				break;
			}
		break;
		case 'establecimientos':
			switch (action) {
				case 'view':
					Controller('EstablecimientosView');
				break;
			}
		break;
		case 'home':
			Controller('Home')
		break;
		case 'productos':
			switch (action) {
				case 'carrito':
					Controller('ProductosCarrito');
				break;
			}
		break;
		case 'pedidosonlines':
			switch(action) {
				case 'pedido':
					Controller('Pedido');
				break;
			}
		break;
		case 'usuarios':
			switch(action) {
				case 'micuenta':
					Controller('MiCuenta');
				break;
			}
		break;
	}

	var userAgent = navigator.userAgent;
	if(userAgent.indexOf("MSIE")!==-1){
		Controller('InternetExplorer');
    }

    //Controller('InternetExplorer');
	// console.image("http://i.imgur.com/oGiMR.gif");
});

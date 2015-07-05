define(function(require) {
	/** 
		Desde acá controlamos todo el menú de la página
		se le hace bind a los botones y se interactúa con los configurables
		pasando la información al carrito para que lo agregue al pedido.

		Formato de productos que devuelve el menú es el siguiente:

		[{
			id: Int,
			name: String,
			description: String,
			category_name: String,
			price: Float,
			options: [
				{
					id: Int,
					name: String,
					values: [{ // Valor de las opciones selecionadas
						name: String,
						price: Float,
						quantity: Int
					}, ...]
				}, ...
			],
			quantity: Int
		}]
	**/
	var Format 	 	= require('Utils/Format');
	var Modal 		= require('Tools/Modal');
	var Slider   	= require('Tools/Slider');
	var Network 	= require('Utils/Network');
		Network 	= new Network();

	var CoberturaModal = require('Tools/CoberturaModal');

	function Menu(Carrito, Cobertura) {
		if($('.menu-config') === []) {
			return false
		}

		if($('.slider').length) {
			new Slider('.slider');
		}

		var menuButtons = $('.menu-config'),
			primerPedido = false, sugerirModal = null,
			configModal = new Modal('menuConfig');
		
		var modalEl = $(configModal.element());

		if($('#sugerirModal').length > 0) {
			sugerirModal = new Modal('sugerirModal');
			sugerirModal.set('content', $('#sugerirModal').html());
		}

		menuButtons.click(function() {
			$(this).addClass('loading')
                       
			if(CoberturaModal.conCobertura() === 0 && es_franquicia) {
				// Aún no sé dónde está el usuario, abro el modal de config y al volver, 
				// Agrego este producto
				var _self = $(this);
                                
				CoberturaModal.modalCobertura(function(data) {
                                        
					if(data.response === false) {
						// Muestro el modal de sugerencias para pedir
						_self.removeClass('loading');
						sugerirModal.show();
						return;
					}

					addToCart(_self);
				})

				return;
			}

			addToCart($(this))
		})

		window.addEventListener('resize', function() {
			if(window.innerHeight > 600) return 
			modalEl.find('.menu-box').css('maxHeight', (window.innerHeight - 200) + 'px')
		})

		// Agrega funcionalidad al hacer click en una categoría para que de scroll
		// hasta la categoría correspondiente:
		$('.menu-categories ul li').click(function(e) {
			
			var el = $('h4[data-id="' + this.getAttribute('id') + '"]');
			if(el.length > 0) {
				var box = $('h4[data-id="' + this.getAttribute('id') + '"]').box();
				window.scrollBy( 0, box.top-37);
			}
		})

		// Realiza la acción cuando el usuario da click a un botón de agregar al carrito
		function addToCart(self) {
			product_id = parseInt(self.attr('data-json'))
			if(isNaN(product_id) || self.attr('loading')) return false

			self.attr('loading', 'loading')

			// Obtenemos los detalles de este producto, si es configurable se abre el modal
			Network.get(app.base_uri + 'establecimientos/producto/' + product_id + '/' + establecimiento_id, null, function(data) {
				self.removeClass('loading').removeAttr('loading')

				var data = JSON.parse(data)
				if('grupoextras' in data && data.grupoextras.length === 0) {
					// Este elemento no es configurable, por lo tanto se agrega directamente al carrito:
					Carrito.add(normalizeProduct(data))
					return false
				}

				// Dado que este producto es configurable, abro el menú configurable
				var menuHTML = menuConfig(data)
				configModal.set('content', menuHTML)
				
				var h = (window.innerHeight - 200);
				modalEl.find('.menu-box').css('maxHeight', ((h > 394) ? 394 : h) + 'px');

				bindConfig();
				updateTotal();
				configModal.show();

				// Ajusta los height de los label para que quede bien organizado
				$('label', modalEl).each(function(i) {
					if(i%2 == 0) {
						var next = $(this).eq(i+1);
						if(next.length) {
							labelSize = $(this).box();
							nextSize  = next.box();

							if(nextSize.height < labelSize.height) {
								next.css('height', labelSize.height + 'px');
							} else $(this).css('height', nextSize.height + 'px');
						}
					}
				})
			})
		}

		// Controla toda la interacción que sucede dentro del modal
		var totalEl = null,
			totalValue = null,
			extras = null, extrasEls = null,
			addBtns = null, groups = null

		function bindConfig() {
			// Se corrigen los textos para que se vea bien el valor de dinero:
			var elementosDinero = $('.dinero', modalEl);
			for(var i = 0; i < elementosDinero.length; i++) {
				var elementoDinero = elementosDinero[i];
				elementoDinero.textContent = Format.currency(parseFloat(elementoDinero.textContent), '$ ');
			}

			// Hago bind a los cambios de select o checkboxes/radios para actualizar el precio
			// que se muestra en el modal:
			var extras    = $('.menu-box input, .menu-box select', modalEl);
			extrasEls = extras;
			
			extras.on('change', function() { updateTotal() });
			
			groups = $('.menu-box li', modalEl);
			if(groups instanceof Element) groups = [groups];

			var addBtns = $('.menu-box .add-more', modalEl).click(function(e) { 
				e.stopPropagation();
				e.preventDefault();

				updateTotalAmount(e);
			});

			totalEl    	  = $('.total-box .dinero', modalEl);
			var totalValue 	  = parseFloat( totalEl.attr('data-init-price') );

			totalEl.attr('data-total', totalValue);
			totalEl.text( Format.currency(totalValue) );

			// Finalmente habilito el click al elemento de agregar al carrito
			// cuando el usuario da click acÃ¡, verifico que el menÃº estÃ© correctamente configurado
			// si no cumple, se muestra el error:
			$('.add_cart', modalEl).click(function() {
				if(validConfig() === true) {
					Carrito.add(getProductConfigured())
					configModal.hide()
				}
			})
		}

		// Valida que se cumplan los lÃ­mites y opciones del carrito
		// devuelve true si se puede continuar y agregar al carrito
		// si devuelve false, se muestra el error ocurrido y se colorea el grupo extra que debe ser corregido
		function validConfig() {
			var valid = true;

			for(var i = 0; i < groups.length; i++) {
				var container = groups[i]
				var $group = $('.item-group', container)
                                var group  = $group;

				var max = parseInt( $group.attr('data-max') );
				var min = parseInt( $group.attr('data-min') );
				var checked = $('input:checked', group).length;
				var select  = $('select', group);

				var addPlus  = $('input[type=text]', group);
				// Si tengo inputs (add +-) entonces cuento los values como checked
				if(addPlus.length > 0) {
					checked = 0;
					var plus = addPlus;
					for(var i = 0; i < plus.length; i++) {
						checked += ( isNaN(parseInt(plus[i].value)) ) ? 0 : parseInt(plus[i].value);
					}
				} 

				var error_selector = $('.error-msg', container);
				error_selector.hide();

				var errors = false;

				if(select.length > 0) {
					if(select.find('option:selected').hasClass('no-select') === true) {
						error_selector.text(language.menu.selecciona_configuracion);
						errors = true;
					}
				} else {

					// Valido que uno estÃ© seleccionado como minimo
					if(max == min && max > 1) {
						if(checked < min) {
							// Se debe cumplir la condiciÃ³n de 1 a 1
							error_selector.text( language.menu.seleccion_cantidad_fija.format(min)  );
							errors = true;
						}
					} else {
						if( checked < min ) {
							// Se debe seleccionar mÃ­nimo 1
							error_selector.text( language.menu.selecciona_item.format(group.getAttribute('data-name')) );
							errors = true;
						}
					}	

				}

				if(errors === true) {
					error_selector.show();
					valid = false;
				}
			}

			// No ocurrió error
			return valid;
		}

		// Devuelve el arreglo del producto configurado
		function getProductConfigured() {
			updateTotal() // Corre el update de nuevo para evitar que alguien haya modificado el HTML live

			var info = modalEl.find('h2');

			product = {
				id: info.attr('id'),
				name: info.text(),
				description: info.parent().find('p.desc').text() || '',
				category_name: info.attr('data-cat') || '',
				price: parseFloat(totalEl.attr('data-total')),
				options: [],
				discount: info.attr('data-discount'),
				quantity: 1
			}

			for(var e = 0; e < groups.length; e++) {
				var container = groups[e];
				var group  = $('.item-group', container);

				var option = {
					id: parseInt(group.attr('data-id')),
					name: group.attr('data-name'),
					values: []
				};

				var checked  = $('input[type!=text]:checked', group);
				var select   = $('select', group);
				var addPlus  = $('input[type=text]', group)

				if(checked.length > 0) {
					for(var i = 0; i < checked.length; i++) {
						option.values.push({
							id: parseInt(checked[i].id),
							name: checked[i].getAttribute('data-name'),
							price: parseFloat(checked[i].getAttribute('data-price')) || 0,
							discount: parseInt(checked[i].getAttribute('data-discount')),
							quantity: 1
						});
					}
				}

				if(select.length > 0) {
					select = select.find('option:selected');
					for(var i = 0; i < select.length; i++) {
						option.values.push({
							id: parseInt(select[i].id),
							name: select[i].getAttribute('data-name'),
							price: parseFloat(select[i].getAttribute('data-price')) || 0,
							discount: select[i].getAttribute('data-discount'),
							quantity: 1
						});
					}
				}

				if(addPlus.length > 0) {
					// Los addPlus son inputs, cuento su valor como quantity...
					for(var i = 0; i < addPlus.length; i++) {
						if(addPlus[i].value === null || parseInt(addPlus[i].value) == 0) continue
						option.values.push({
							id: parseInt(addPlus[i].id),
							name: addPlus[i].getAttribute('data-name'),
							price: parseFloat(addPlus[i].getAttribute('data-price')) || 0,
							discount: parseInt(addPlus[i].getAttribute('data-name')),
							quantity: parseInt(addPlus[i].value)
						});
					}
				}

				product.options.push(option);
			}

			return product
		}

		// + y - input total
		function updateTotalAmount(e) {
			e = e.target;
			if(e.tagName == 'DIV') {
				e = $(e);
				if(e.hasClass('disabled')) return false;
				var input = e.parent().find('input');

				if(e.hasClass('add')) {
					add = 1;
				} else add = -1;

				ammount = (isNaN(parseInt(input.value()))) ? 0 : parseInt(input.value()) + add
				input.value((ammount < 0) ? 0 : ammount)

				updateTotal()
			}
		}

		function updateTotal() {
			var total = parseFloat(totalEl.attr('data-init-price'))

			// Recorro todos los inputs o selects que hay para sacar el total del menÃº
			var es2x1 = $('.modal .content h2').attr('data-2x1');
			
			if(es2x1!='0'){
			    
			}
			var primera_mitad = 0;
			var segunda_mitad = 0;
			for(var i = 0; i < extrasEls.length; i++) {
				extra = extrasEls[i];
//				console.log($(extra).parent().attr('data-aplica_2x1'));
				price = parseFloat(extra.getAttribute('data-price'))

				switch(extra.tagName.toLowerCase()) {
					case 'input':
						switch(extra.type) {
							case 'checkbox':
							case 'radio':
								if(extra.checked) total += price // SÃ³lo si estÃ¡ checked suma
							break;
							case 'text':
								var quantity = parseInt(extra.value)
								
								if( isNaN(quantity) ) quantity = 0
								if(quantity > 0) {
									price *= quantity
									total += price
								}

								extra.value = quantity
							break;
						}
					break;
					case 'select':
					        var aplica_2x1 = $(extra).parent().attr('data-aplica_2x1');
						console.log(aplica_2x1);
						if(aplica_2x1=='1'){
						    if(primera_mitad==0 || isNaN(primera_mitad)){
							primera_mitad = parseFloat( extra.options[extra.selectedIndex].getAttribute('data-price') );
						    }else{
							segunda_mitad = parseFloat( extra.options[extra.selectedIndex].getAttribute('data-price') ); 
						    }
						    
						     price = parseFloat(0);
						    
						}else{
						    price = parseFloat( extra.options[extra.selectedIndex].getAttribute('data-price') );
						}
						
						if(!isNaN(price)) total += price
					break;
				}
			}
			switch(es2x1){
			    case '1': //2x1 selecciona el mayor
			       if(primera_mitad>segunda_mitad){
				   total += primera_mitad;
			       }else{
				   total += segunda_mitad; 
			       }
			    break;
			    case '2': //2x1 selecciona promedio
			         total += (primera_mitad+segunda_mitad)/2;
			    break;
			    case '3': //2x1 selecciona el menor
			       if(primera_mitad<segunda_mitad){
				   total += primera_mitad;
			       }else{
				   total += segunda_mitad; 
			       }
			    break;
			}

			checkLimits()

			totalValue = total
			totalEl.attr('data-total', totalValue)
			totalEl.text( Format.currency(totalValue) )
		}

		// Esta funcion valida que no se excedan los limites de max-min
		// tanto en los + y - como en los checkboxes
		function checkLimits() {
			for(var e = 0; e < groups.length; e++) {
				var container = groups[e]
				var group = $('.item-group', container)

				var max = parseInt(group.attr('data-max'))
				var min = parseInt(group.attr('data-min'))
				var checked = $('input:checked', group).length;
				
				var addPlus  = $('input[type=text]', group)
				// Si tengo inputs (add +-) entonces cuento los values como checked
				if(addPlus.length > 0) {
					checked = 0
					for(var i = 0; i < addPlus.length; i++) {
						checked += ( isNaN(parseInt($(addPlus[i]).value())) ) ? 0 : parseInt($(addPlus[i]).value())
					}
				} 

				disable = undefined;

				// Valido que uno está seleccionado como minimo
				if(min > 0 && max > 0) { 
					if(max == min && max > 1) {
						if(checked == min) disable = true;
						else disable = false;
					} else {
						if(checked == max) disable = true; // Si llegué al max, bloquea
						else disable = false;
					}
				}

				if(disable !== undefined) {
					if(disable) {
						if(addPlus.length) $('.add', group).addClass('disabled')
						$('input:not(:checked)', group).attr('disabled', 'disabled')
					} else {
						if(addPlus.length) $('.add', group).removeClass('disabled')
						$('input[disabled]', group).removeAttr('disabled')
					}
				}
			}
		}

		// Se le pasa un producto del carrito y lo normaliza
		// a nuestro formato estÃ¡ndard para que el Carrito no tenga que
		// procesar esto
		function normalizeProduct(data) {
			normalized = {
				id: data.id,
				name: data.nombre,
				description: data.descripcion || '',
				category_name: data.categoria || '',
				price: parseFloat(data.precio || 0),
				options: [],
				quantity: 1,
				discount: data.descuento_activo
			}

			return normalized
		}

		// Actualizar esto que es bastante feo: <!!!!!!!!!!!!!!!!!!!!!!!!>
		function menuConfig(menu) {
			precio = (menu.precio).toString();
			var es_2x1 = 'data-2x1="0"';
			if(typeof menu.es_2x1 !="undefined" && menu.es_2x1!='0'){
				    es_2x1= 'data-2x1="'+menu.es_2x1+'"';
				}
			var html  = '<h2 class="red bold title" id="' + menu.id + '" style="width: 450px" '+es_2x1+' data-establecimiento="' + menu.establecimiento_id + '"  data-discount="' + menu.descuento_activo + '" data-name="' + menu.establecimiento + '" data-dom="' + menu.domicilio + '" data-cat="' + menu.categoria + '">' + menu.nombre + '</h2>\
						<p class="desc">' + menu.descripcion + '</p><div class="total-box top">';
				console.log(menu);
				
				html += '<span class="price light-gray ">Total: <span class="dinero orange" data-total="" data-init-price="' + precio + '"></span></span><div class="button blue round5 add_cart">' + language.menu.agregar_bolsa + '</div></div><div class="menu-box"><ul>';
			    //html += '<li class="clearfix"><div class="item-info"><h4 class="red bold">Cantidad</h4><p>Seleccione cuÃ¡nto de Ã©ste producto desea ordenar</p></div><div class="item-group"><select class="cantidad no-select"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div></li>';
				var i = 0, e = 0;
				for(i = 0; i < menu.grupoextras.length; i++) {
					var extra = menu.grupoextras[i];
					var total_extras = extra.extras.length;
					console.log(extra);
					var aplica_2x1 = 'data-aplica_2x1="0"';
					if(typeof extra.aplica_2x1 !="undefined" && extra.aplica_2x1!='0'){
					    aplica_2x1= 'data-aplica_2x1="'+extra.aplica_2x1+'"';
					}
					var seleccion_multiple = extra.seleccion_multiple;

					var min = extra.min;
					var max = extra.max;

					if(min == 1 && max == 1) {
						seleccion_multiple = false;
					}

					var seleccion_msg = (seleccion_multiple) ? language.menu.multiple : language.menu.unico;

					if(min > 0 && max > 1 && (max != min)) {
						seleccion_msg = language.menu.seleccion_cantidad.format(min, max)
					}

					if(min > 0 && max > 1 && (max == min)) {
						seleccion_msg = language.menu.seleccion_cantidad_fija.format(min)
					}

					if(min > max) {
						max = min;
						min = max;
					}

					html += '<li class="clearfix">\
						<div class="item-info">\
							<h4 class="red bold">' + extra.nombre + '</h4>\
							<p>' + seleccion_msg + '</p>\
							<div class="error-msg"></div>\
						</div>\
						<div class="item-group" '+aplica_2x1+' data-id="' + extra.id + '" data-name="' + extra.nombre + '" data-min="' + min + '" data-max="' + max + '" data-multiple="' + ((seleccion_multiple) ? 1 : 0) + '">';

						if(seleccion_multiple === false) html += '<select><option class="no-select" value="seleccionar">Elegir</option>';
						for(e = 0; e < extra.extras.length; e++) {
							var item = extra.extras[e];
							if(seleccion_multiple === false) {
								html += '<option data-price="' + item.precio + '" data-discount="' + item.discount + '" data-price-type="total" data-name="' + item.nombre + '" name="' + item.grupos_extras_id + '" id="' + item.id + '" value="1">' + item.nombre + ' (' + Format.currency(parseFloat(item.precio)) + ')</option>';
							} else {
								// Si es multiple, y se puede seleccionar cuantos uno quiera, entonces hay opciÃ³n de + y -, de lo contrario son checkbox
								if(min == total_extras || ( min>0 && min == max && min != 1)) {
									html += '<label><div class="add-more"><div class="minus button blue">-</div><div class="in"><input readonly="readonly" type="text" data-price="' + item.precio + '" data-discount="' + item.discount + '" data-price-type="quantity" data-name="' + item.nombre + '" name="' + item.grupos_extras_id + '" id="' + item.id + '" type="text" value="0" /></div><div class="add button blue">+</div></div><div>' + item.nombre + '<span class="min-text"> + <span class="dinero">' + item.precio + '</span></div></label>';	
								} else {
									html += '<label><input data-price="' + item.precio + '" data-discount="' + item.discount + '" data-price-type="total" data-name="' + item.nombre + '" name="' + item.grupos_extras_id + '" id="' + item.id + '" type="checkbox" value="1"><span>' + item.nombre + '</span><span class="min-text"> + <span class="dinero">' + item.precio + '</span></span></label>';	
								}
							}
						}
						if(seleccion_multiple === false) html += '</select>';
					html += '</div></li>';			
				}
				html += '</ul></div>';
			return html;
		} // menuConfig
		
		
	   var supermenu = $('li.super');
	    supermenu.promise().done(function( arg1 ) {
	    var _slibing = supermenu.next('ul');
	    _slibing.addClass('submenu-italic');
	    $('.submenu-italic').prev().addClass('cat_arrow');
	  });
	  
	  $('li.super').on('click',function(){
	    var subcat = '#sub-'+this.id;
	    if($(this).hasClass('open')){
		$(this).removeClass('open');
		$(subcat).animate({height:0});
	    }else{
		var subcat = '#sub-'+this.id;
		var cat_chidren = $(subcat).children();
		var _height = 0;
		$.each(cat_chidren,function(k,v){
		    var child_box = $(v).box();
		    _height = _height+child_box.height;
		});

		$(subcat).animate({height:_height});
		$(this).addClass('open');
	    }
	     
	     
	     
	  });
  

	if(typeof $('#this_hours').val()!='undefined' && typeof $('#this_minutes').val()!='undefined'){
	    var horasumada = parseInt($('#this_hours').val());
	    var minutosumado = parseInt($('#this_minutes').val());
	    var fecha = new Date();
	    var fecha2 = new Date(fecha.getFullYear() ,  parseInt(fecha.getMonth()+1), fecha.getDate() , parseInt(fecha.getHours()+horasumada), parseInt(fecha.getMinutes()+minutosumado),fecha.getSeconds());
	    
	    var horas = (fecha2.getHours() < 10) ? ("0" + fecha2.getHours()) : fecha2.getHours(); 
	    var minutos = (fecha2.getMinutes() < 10) ? ("0" + fecha2.getMinutes()) : fecha2.getMinutes();
	    var count_to =  parseInt(fecha2.getMonth() +1) + "/" + fecha2.getDate() + "/" + fecha2.getFullYear()+' '+horas+':'+minutos+':00';
	    $('#flipcountdownbox1').flipcountdown(
		{
		    size:"sm",
		    showHour:false,
		    beforeDateTime:count_to  /*  1/01/2015 00:00:01  */
		});
		
	    var digits = $('#flipcountdownbox1').children().children();
	    $.each(digits,function(k,v){
		if(k==0 || k==1 || k==2){
		    $(v).hide();
		}
	    });   
	}
	    
	    
	}	


	
	return Menu;
})

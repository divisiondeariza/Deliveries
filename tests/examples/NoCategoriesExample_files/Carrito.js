define(function(require) {
	var Domicilio = require('PedirOnline/Domicilio')
	var Format    = require('Utils/Format')
	var FormSubmit = require('Utils/FormSubmit')

	var Storage   	 = require('Utils/Storage')
	var BoundingBox  = require('Utils/BoundingBox')
	var Scroll 		 = require('Utils/Scroll')

	function Carrito() {
		var cartElement 	= $('#cart');
		if(cartElement.length === 0) {
			return false
		}

		var totalOrder 		= $('.total-order', cartElement);
		var cartContenedor 	= $('.contenido-carrito', cartElement);
		var productos 		= Storage.value('cart-' + establecimiento_id) || {};
		var descuentos 		= [];
		var poscategorias   = {};

		var menu_element = $('.menu');
		var cart_element = $('.cart-box');
		var cat_element  = $('.menu-categories');
		var cart_content = $('.contenido-carrito', cart_element);

		var detalle = {
			comentarios: '',
			total: 0,
			domicilio: 0,
			descuentos: 0,
			elements: {}
		};

		// Actualiza el arreglo que contiene la posición
		// de las categorias para marcar mientras se hace scroll
		var titulos_categorias = $('.menu-items h4.red');

		Scroll.add(cartScroll);
		window.addEventListener('resize', fixCartHeight);
		setTimeout(fixCartHeight, 1000);

		if(typeof productos == 'string') {
			var _productos = JSON.parse(productos);
			productos  = {};

			// Contruye el carrito:
			for(var i = _productos.length-1; i >= 0; i--) {
				createProduct(_productos[i]);
			} 

			updateView();
		}

		comentariosBox = newElement('textarea', 'comentarios', '');
		comentariosBox.attr('placeholder', language.carrito.comentarios);
		comentariosBox.on('keyup', function() {
			detalle.comentarios = this.value;
			Storage.value('comments-' + establecimiento_id, this.value);
		});

		totalOrder.prepend(comentariosBox)

		$('.btn-hacer-pedido').click(function() {
			$(this).addClass('loading')

			// backward el carrito para dar soporte a las versiones anteriores
			if(detalle.total < min_order) {
				alert(language.view.no_alcanza);
				$(this).removeClass('loading');
				return false;
			} else if(detalle.items == 0) {
				alert(language.view.bolsa_vacia);
				$(this).removeClass('loading');
				return false;
			}

			var cart = cleanCart();
			FormSubmit.submit(url_carrito, {cart: JSON.stringify(cart)});
		})

		btnBorrar = $('.trash', cartElement)
		btnBorrar.click(function() {
			if(confirm(language.carrito.borrar_carrito)) {
				for(var i in productos) {
					removeProduct(i)
				}
			}
		})

		cartScroll()

		this.add = function(data) {
			// Valido si el producto está en el carrito para sumarle a la cantidad 1
			// si tiene configuraciones, ignoro esta validación ya que no pueden haber 2 configuraciones iguales (se requiere validar cada opción...)
			existingProduct = findProduct(data.id)
			if(existingProduct && data.options.length == 0) {

				// valida si tiene cantidad restringida.
				
				if(productos[existingProduct].restringir>0){
					
					if(productos[existingProduct].restringir!=0 && productos[existingProduct].quantity >= productos[existingProduct].restringir){
					    
					    alert('No puedes agregar mas de '+productos[existingProduct].restringir+' items de este producto!')
					}else{
					    productos[existingProduct].quantity += 1;
					}
				    
				}else{
				    productos[existingProduct].quantity += 1;  
				}
				
				updateProduct(productos[existingProduct])
			} else {
			    
				createProduct(data)
			}

			saveCart()
		}

		function findProduct(id) {
			for(var i in productos) {
				if(productos[i].id == id) return i
			} return false
		}

		function saveCart() {
			var json = []

			for(var i in productos) {
				var producto = productos[i]
				var _producto = {}
				
				for(var attr in producto) {
					if(attr == 'element' || attr == 'subElements') continue;
					_producto[attr] = producto[attr]
				}

				json.push(_producto)
			}

			Storage.value('cart-' + establecimiento_id, JSON.stringify(json))
			updateView()
		}

		// Elimina un producto del carrito y de la lista de productos
		function removeProduct(product_id) {
			if(product_id in productos) {
				var el = productos[product_id].element
				delete productos[product_id]

				el.animEnd(function() {
					el.remove()
					saveCart()
				}).addClass('flipOutX')
			}
		}

		this.remove = function(product_id) {
			removeProduct(product_id)
		}

		// Actualiza la cantidad y precio del producto
		function updateProduct(product, reverse) {
			var reverse = reverse || false;
			var classAnim = (reverse) ? 'flipOutX' : 'flipInX';

			/*var _el = new Selector(product.element)
				_el.animEnd(function() {
					this.removeClass(classAnim)
				}).addClass(classAnim)*/

			var _price 		= product.subElements.price
			var _quantity 	= $('span', product.subElements.quantity)

			_price.html( Format.currency( parseFloat(product.price) * product.quantity ) )
			_quantity.html( product.quantity )

			saveCart()
		}

		function createProduct(product) {
			
			cantidad = 0;
			$.each($('.p_'+product.id),function(k,v){
			  cantidad = cantidad + parseInt($(v).children('.product-quantity').children('span').html()); 
			});
			console.log(product);
			if(product.restringir!=0 && cantidad>=product.restringir){
			    alert('No puedes agregar mas de '+product.restringir+' items de este producto!');
			    return false;
			}
			var productEl = newElement('li', 'product '+'p_'+product.id, '');

			local_id = Math.floor( Math.random(10000, 100000) * 100000 )

			elementsAdd = [
				{ name: 'name', value: product.name },
				{ name: 'description', value: product.description },
				{ name: 'price', value: Format.currency( parseFloat(product.price) * product.quantity ) },
				{ name: 'quantity', value: language.carrito.cantidad + '<span>' + product.quantity + '</span>' }
			]

			elementsList = {}

			for(var i = 0; i < elementsAdd.length; i++) {
				var el = newElement('div', 'product-' + elementsAdd[i]['name'], elementsAdd[i]['value']) 
				productEl.append( el )
				elementsList[elementsAdd[i]['name']] = el;
			}

			// Agrega el detalle de la configuración
			if(product.options.length > 0) {
				var optionsEl = newElement('ul', 'product-options', '')

				for(var p = 0; p < product.options.length; p++) {
					var option = product.options[p]
					var values = []

					if( option.values.length == 0 ) continue
					for(var v = 0; v < option.values.length; v++) {
						values.push( option.values[v].name.replace('.$', '') )
					}

					text =  '<b>' + option.name + ': </b>' + values.join(', ')
					optionsEl.append(newElement('li', '', text))
				}

				productEl.append( optionsEl )
			}

			// Agrega los botones de cantidad:

			addBtn = newElement('div', 'add-btn', '')
			addBtn.attr('data-product', local_id)
			addBtn.attr('data-restringir', product.restringir)
			addBtn.attr('title', language.carrito.agregar)
			addBtn.click(function() {
				addRemove(this.getAttribute('data-product'), true)
			})

			delBtn = newElement('div', 'delete-btn', '')
			delBtn.attr('data-product', local_id)
			delBtn.attr('data-restringir', product.restringir)
			delBtn.attr('title', language.carrito.eliminar)
			delBtn.click(function() {
				addRemove(this.getAttribute('data-product'), false)
			})

			productEl.append(addBtn)
			productEl.append(delBtn)

			elementsList['add'] 	= addBtn
			elementsList['remove'] 	= delBtn

			// Agrega al objeto del producto sus elementos (principal y los interiores)
			product['element'] = productEl
			product['subElements'] = elementsList
			product['local_id'] = local_id

			productos[local_id] = product

			product.element.animEnd(function() {
				$(this).removeClass('flipInX')
			}).addClass('animated')

			cartContenedor.prepend(productEl)
			
			updateView()
			product.element.addClass('flipInX')
		}

		function addRemove(product_id, add) {
			if(product_id in productos) {
				add = (add) ? 1 : -1
				
				cantidad = 0;
				$.each($('.p_'+productos[product_id].id),function(k,v){
				  cantidad = cantidad + parseInt($(v).children('.product-quantity').children('span').html()); 
				});
				
				console.log(cantidad);
				if(add !==-1){
				    if(productos[product_id].restringir!=0 && cantidad>=productos[product_id].restringir){
					alert('No puedes agregar mas de '+productos[product_id].restringir+' items de este producto!');
					return false;
				    }
				}
				
				if(productos[product_id].restringir>0){
				    if(add !==-1){
					if(productos[product_id].quantity>=productos[product_id].restringir){
					    productos[product_id].quantity = parseInt(productos[product_id].restringir); 
					    alert('No puedes agregar mas de '+productos[product_id].restringir+' items de este producto!')
					}else{
					    productos[product_id].quantity += add;
					}
				    }else{
					productos[product_id].quantity += add;  
				    }
				}else{
				    productos[product_id].quantity += add;  
				}
				
				

				if(productos[product_id].quantity == 0) {
					removeProduct(product_id)
				} else {
					updateProduct(productos[product_id], true)
				}
				
			}
		}

		function updateView() {
			if(objSize(productos) > 0) {
				cartContenedor.addClass('order');
				$('.total-order', cartElement).show();
			} else {
				cartContenedor.removeClass('order');
				$('.total-order', cartElement).hide();
			}

			total = 0, discounts = 0, items = 0;
			for (id in productos) {
				producto = productos[id];
				items += 1 * parseFloat(producto.quantity);
				total += (parseFloat(producto.price) * parseFloat(producto.quantity));
				if(!isNaN(parseInt(producto.discount)) && parseInt(producto.discount) > 0) {
					discounts += ( (parseInt(producto.discount) / 100) * parseFloat(producto.price) ) * parseFloat(producto.quantity);
				} 
			}

			sub_total 			= total;
			detalle.domicilio 	= Domicilio.calcular(total, ('funcion_domicilio' in window) ? funcion_domicilio : '');
			detalle.fn_domicilio =  ('funcion_domicilio' in window) ? funcion_domicilio : '';

			total 		   += detalle.domicilio;
			total 		   -= discounts,

			detalle.total = total;
			detalle.descuentos = discounts;
			detalle.subtotal = sub_total;
			detalle.items = items;

			// Actualiza el total y el domicilio
			if(discounts > 0) {
				$('.discount', totalOrder).text( Format.currency(discounts));
				$('.discount-order', totalOrder).show();
			} else {
				$('.discount-order', totalOrder).hide();
			}

			$('.sub-total', totalOrder).text( Format.currency(sub_total));
			$('.delivery', totalOrder).text( Format.currency(detalle.domicilio));

			$('.total', totalOrder).text( Format.currency(total));
		}

		function newElement(type, className, html) {
			var element = document.createElement(type)
				element.setAttribute('class', className)
				element.innerHTML = html

			return $(element)
		}

		function objSize(obj) {
		    var size = 0, key;
		    for (key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		}

		/* Devuelve un carrito con los datos requeridos por el servidor para pedir */
		function cleanCart() {
			var cart = {
				establecimiento_id: establecimiento_id,
				products: [],
				fn_domicilio: detalle.fn_domicilio,
				comments: detalle.comentarios
			};

			for(var i in productos) {
				var producto = productos[i];
				var _producto = {};
				for(var attr in producto) {
					if(attr == 'element' || attr == 'subElements') continue;
					_producto[attr] = producto[attr];
				}

				cart.products.push(_producto);
			}

			return cart;
		}

		function backwardsCompatibilityCart() {
			var cart = {
				establecimientos: { },
				total: detalle.total,
				total_money: Format.currency(detalle.total),
				subtotal: detalle.subtotal,
				items_total: detalle.items,
				descuentos: detalle.descuentos
			}

			var items = []
			// Crea la estructura de los productos:
			for(var i in productos) {
				producto = productos[i]

				discount = 0
				if(!isNaN(parseInt(producto.discount)) && parseInt(producto.discount) > 0) {
					discount += ( (parseInt(producto.discount) / 100) * parseFloat(producto.price) ) * parseFloat(producto.quantity)
				} 

				details = []
				if(producto.options.length > 0) {
					for(var e = 0; e < producto.options.length; e++) {
						option = producto.options[e]
						extras = []

						for(var j = 0; j < option.values.length; j++) {
							value = option.values[j]
							extras.push({
								id: value.id,
								name: value.name,
								price: value.price,
								price_money: Format.currency(value.price),
								discount: (!isNaN(value.discount) && value.discount > 0) ? (value.discount / 100) * value.price : 0
							})
						}

						details.push({
							group_id: option.id,
							group_name: option.name,
							extras: extras
						})
					}	
				}

				items.push({
					id: producto.id,
					category: producto.category_name + '',
					desc: producto.description + '',
					discount: discount,
					name: producto.name + '',
					total: producto.price,
					total_momey: Format.currency(producto.price),
					details: details,
					quantity: producto.quantity
				})
			}

			cart.establecimientos[establecimiento_nombre] = {
				id: establecimiento_id,
				nombre: establecimiento_nombre,
				subtotal: detalle.subtotal,
				total: detalle.total,
				total_momey: Format.currency(detalle.total),
				comentarios: detalle.comentarios,
				descuento: detalle.descuentos,
				domicilio: detalle.domicilio,
				domicilio_money: Format.currency(detalle.domicilio),
				items: items
			}

			return cart
		}

		var lastActiveCategory = '';

		function cartScroll() {
			if(menu_element.is(':visible') === false) return;

			var box 	= menu_element.box()
			var cartbox = cart_element.box()
			var catbox 	= cat_element.box()
			
			// Aplica el efecto solo cuando el scroll esta dentro del menú
			if(box.top < 0) {
				var to_set = false,
					category_set = false;

				titulos_categorias.each(function(i) {
					var top = $(this).box().top-40;
					// esta es la categoría que estoy viendo:
					if(top < 0) {
						to_set = this.getAttribute('data-id');
						category_set = this;
					}
				})

				if(to_set && (to_set != lastActiveCategory || lastActiveCategory == '')) {
					if(lastActiveCategory) {
						$('#' + lastActiveCategory).removeClass('active');
						$('#' + lastActiveCategory).parent('ul').prev('.cat_arrow').removeClass('active');
					}

					lastActiveCategory = to_set;
					var nowActive = $('#' + to_set).addClass('active');
					if(nowActive.parent().hasClass('submenu-italic') && !nowActive.parent().hasClass('open')) {
					    $('.submenu-italic.open').removeClass('open').css('height', 0);
					    var _height = 0;
					    var _children = $('#' + to_set).parent().children();
					    $.each(_children,function(k,v){
						_height = _height+$(v).box().height;
					    });
					    
					    nowActive.parent().css('height', _height).addClass('open').prev().addClass('active');
					}
				}
			}

			if(box.top <= 0) {
				 menu_element.addClass('scroll'); 
				 
				if(usuario_registrado==1){
				    menu_element.addClass('scroll_registrado');   
				}else{
				      
				}
				
			} else {
				menu_element.removeClass('scroll');
				menu_element.removeClass('scroll_registrado');   
			}

			// Detiene el scroll de las categorias o el carrito cuando tocan el final del menú:
			if(((box.top - (cartbox.height)) * -1) >= box.height) {
				menu_element.addClass('cart-bottom');
			} else {
				menu_element.removeClass('cart-bottom');
			}

			if(((box.top - (catbox.height)) * -1) >= box.height) {
				menu_element.addClass('categories-bottom');
			} else {
				menu_element.removeClass('categories-bottom');
			}
		}

		function fixCartHeight() {
			// Coloca el minimo del height
			var available_space = window.innerHeight - 40; // 20px abajo
			var cart_height =cart_element.box().height;
			var cart_content_height = cart_content.box().height;

			var cart_diff =  cart_height - cart_content_height;
			cart_content.css('max-height', Math.floor(available_space - cart_diff) + 'px');
		}
	}

	return Carrito
})
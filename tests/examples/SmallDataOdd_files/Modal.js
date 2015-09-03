define(function(require) {
	/*
		Modal se encarga de crear los modals de la página automáticamente y animarlos
		expone las siguientes funciones:

		Modal.create(String id, <optional> Object settings): devuelve un (Int) modal_id, por defecto no se muestra
		Modal.set(String header|content|caption, String html, <optional>Int modal_id): Coloca en la parte indicada el contenido html
		Modal.show | hide | remove(<optional> Int modal_id): controla la visibilidad del modal
		Modal.on(String before|show|hide, callback, <optional>Int modal_id): anexa acciones que se ejecutan antes, al mostrar o al ocultar un modal
		Modal.active(Int modal_id): setea el modal_id como el active para no tener que pasarlo a cada función

		Settings: es un objeto con los eventos y los settings del modal
		defaultSettings = {
			before: Function callback,
			show: Function callback,
			hide: Function callback,
			inAnimation: String animationName,
			outAnimation: String animationName,
			close: Boolean closeAllowed
		}
	*/
	var defaultSettings = {
		close: true,
		visible: false,
		before: false, show: false, hide: false,
		inAnimation: 'bounceIn',
		outAnimation: 'noAnim'
	};

	var BoundingBox = require('Utils/BoundingBox');

	function Modal(id, options) {
		return this.initialize(id, options);
	}

	Modal.prototype = {
		settings: null,
		active_modal: null,
		initialize: function(id, options) {
			// Crea el elemento del overlay
			var overlayEl = document.createElement('div')
				document.body.appendChild(overlayEl)

			var overlay = $(overlayEl)
			overlay.addClass('modal-overlay')
				   .animEnd(function() {
				   		if(overlay.hasClass('.fadeOut')) overlay.removeClass('animated')
				   })

			this.overlay = overlay;
			this.create(id, options);
			return this;
		},
		create: function(id, options) {
			var _self 		= this;
			var modalEl = document.createElement('div');
			var modal_id = new Date().getTime();
			var options = options || {};
		 			options = merge_options(defaultSettings, options);

			// Centrar el modal en el evento de resize
			window.addEventListener('resize', function() {
				_self.center()
			})

			//modalEl.setAttribute('id', id)
			modalEl.setAttribute('class', ['modal', 'modal-' + modal_id, id].join(' '))

			modalEl.innerHTML = '\
				<div class="close">&times;</div>\
				<div class="header"></div>\
				<div class="content"></div>\
				<div class="caption"></div>\
			';

			modalEl.style.zIndex = modal_id;

			if(options.close == false) {
				modalEl.querySelector('.close').style.display = 'none';
			}

			var modalSelector = $(modalEl);

			this.modal 	  = modalSelector;
			this.settings = options;

			this.modal.find('.close').click(function(e) {
				e.preventDefault();
				e.stopPropagation();

				_self.hide();

				return false;
			})

			this.overlay.on('click', function() {
				_self.modal.find('.close').trigger('click')
				return false;
			})

			document.body.appendChild(modalEl);
			return this;
		},
		show: function() {
			var _body 		= $('body');
			var _modal 		= this.modal;
			var _settings 	= this.settings;
			var _self 		= this;

			_body.addClass('lock');

			if(_settings['before'] && typeof _settings['before'] == 'function') {
				_settings['before'].call();
			}

			_settings.visible = true;

			this.modal.find('.close-modal, *[data-close="modal"]').click(function(e) {
				e.preventDefault();
				e.stopPropagation();

				_self.hide();

				return false;
			})
			
			this.center(_modal);

			_modal.animEnd(function() {
				_modal.addClass('visible')
					.removeClass(_settings['inAnimation'] + ' animated')

				// Trigger al evnento
				if(_settings['show'] && typeof _settings['show'] == 'function') {
					_settings['show'].call();
				}
			}).addClass(_settings['inAnimation'] + ' animated');

			var ev = document.createEvent('Event')
				ev.initEvent('modal_shown', false, false, false)
				ev.detail = false

			window.dispatchEvent(ev);

			this.overlayStatus(true);
            $(_modal).show();

			return this
		},
		hide: function(hideOverlay) {
			var _body 		= $('body');
			var _modal 		= this.modal;
			var _settings 	= this.settings;
			var _self 		= this;
			this.settings.visible = false;
			_modal.addClass(_settings['outAnimation'] + ' animated')

			_body.removeClass('lock');
			if(this.settings.outAnimation == 'noAnim') {
				_modal.removeClass(_settings['outAnimation'] + ' animated visible')
	
				if(_settings['hide'] && typeof _settings['hide'] == 'function') {
					_settings['hide'].call();
				}
			} else {
				_modal.animEnd(function() {
					_modal.removeClass(_settings['outAnimation'] + ' animated visible')

					if(_settings['hide'] && typeof _settings['hide'] == 'function') {
						_settings['hide'].call();
					}
				});
			}

			this.overlayStatus(false)
      		
      		$(_modal).hide();
			return this
		},

		element: function() {
			return this.modal;
		},

		remove: function() {
			var _modal 		= this.modal;
			var _settings 	= this.settings;
			var _self 		= this;

			_modal.addClass(_settings['outAnimation'] + ' animated')
			.animEnd(function() {
				_modal.removeClass(_settings['outAnimation'] + ' animated visible')

				/* Elimina completamente */
				_modal.remove()
			 	_self.modals.slice(id, id+1)
				_self.modals_settings.slice(id, id+1)

				_self.overlayStatus(false)
			})

			return this
		},
		on: function(event, callback) {
			this.settings[event] = callback;
			return this;
		},
		set: function(part, content) {
			this.modal.find('.' + part).html(content);
			//this.center()
			return this;
		},
		overlayStatus: function(show) {
			var animated = false; // previene que se agrege la clase animated si no se agregó un efecto
			var overlayVisible = true; // Validar que el overlay esté visible

			if(show) {
				this.overlay.css('display', 'block')
				this.overlay.addClass('fadeIn').removeClass('fadeOut')
				animated = true
			} else {
				this.overlay.addClass('fadeOut').removeClass('fadeIn')
				this.overlay.animEnd(function() {
					$(this).css('display', 'none').off();
				})
				animated = true
			}

			if(this.overlay.is('.animated') == false && animated) {
				this.overlay.addClass('animated')
			}
		},
		center: function(ready) {
			this.modal.removeClass('ready');
			var modalHeight = this.modal.height();
			var modalWidth = this.modal.width();

			this.modal.css({
				marginLeft: ( Math.floor(modalWidth / 2) * -1) + 'px',
				marginTop: ( Math.floor(modalHeight / 2) * -1) + 'px',
			 	top: '50%',
			 	left: '50%'
			})

			// Oculta el modal ya que fue centrado
			this.modal.addClass('ready')
		}

		// center: function(ready) {
		// 	if(this.modal.is(':visible') === false) return;
		// 	this.modal.removeClass('ready');
		// 	var boundingBox = this.modal.box();
		
		// 	this.modal.css({
		// 		marginLeft: ( Math.floor(boundingBox.width / 2) * -1) + 'px',
		// 		marginTop: ( Math.floor(boundingBox.height / 2) * -1) + 'px',
		// 	 	top: '50%',
		// 	 	left: '50%'
		// 	})

		// 	// Oculta el modal ya que fue centrado
		// 	this.modal.addClass('ready')
		// }
	}

	function merge_options(obj1,obj2) {
	    var obj3 = {};
	    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	    return obj3;
	}

	return Modal
})

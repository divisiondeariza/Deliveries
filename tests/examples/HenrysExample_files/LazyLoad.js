define(function(require) {
	function LazyLoad() {
		var images = [];

		// Busca todas las imagenes en la página que estén con la clase img-load (LazyLoad friendly ;))
		this.init = function() {
			images = $('img.image-load')
			// Agrega el evento del scroll para manejar la carga automática
			$(window).on('scroll', pageScroll)
					 .on('lazyload', pageScroll);
			
			pageScroll();
			setTimeout(function() {
				pageScroll();
			}, 1000);
		}

		function pageScroll() {
			for(var i = 0; i < images.length; i++) {
				if(elementInViewport(images[i])) {
					// La imagen está visible, mostrarla y borrarla de la lista de imagenes
					new loadImage(images[i]);
					images.splice(i, 1);
				}
			} 
		}

		function loadImage (el) {
			this.el = el;
			return this.load()
		}

		loadImage.prototype = {
			img: null,
			src: null,
			el: null,
			load: function() {
				var self = this;
			    this.img = new Image(),
			    this.src = this.el.getAttribute('data-src');

				this.img.onload = function() {
				    if (!! self.el.parent) { 
				        self.el.parent.replaceChild(self.img, self.el)
				    } else {
				        self.el.src = self.src;
				    }
			    }

				this.img.onerror = function() {
			    	self.el.src = app.imagen_default_restaurante;
			    }

			    this.img.src = this.src;
			    this.el.setAttribute('loading', 'true');
			}
	  	}

		function elementInViewport(el) {
		    var rect = $(el).offset(),
		    	scroll = $(window).scrollTop() + window.innerHeight;

		    return (
		       rect.top    >= 0
		    && rect.left   >= 0
		    && rect.top <= scroll
		    );
		}

		return this;
	}

	return LazyLoad();
})
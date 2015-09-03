define(function(require) {
	/*
		new Slider(element, {
			switchTime: 10000,
		})
	*/

	function Slider() {
		this.slider = $(arguments[0])
		this.sliderEl = this.slider;

		if(typeof arguments[1] === 'object') {
			for(var i in arguments[1]) {
				if(typeof this[i] === 'function') continue
				this[i] = arguments[1][i]
			}
		}

		this.init()
	}

	Slider.prototype = {
		current: 0,
		slider: null,
		sliderEl: null,
		slides: null,
		switchTime: 10000,
		timer: null,
		init: function() {
			if(this.slider === null) return false;

			this.slides = this.slider.find('li.slide');
			if(this.slides.length < 1) return false;
			// Activo la primera
			this.slides.eq(this.current).addClass('active');
			// Si solo tengo una, continúo
			if(this.slides.length == 1) return false;

			var _self = this
			// Attach keyboard strokes
			document.body.addEventListener('keydown', function(e) {
				if(e.keyCode == 39) _self.next()
				if(e.keyCode == 37)	_self.prev()
			})

			// Hook the buttons
			var backBtn = document.createElement('div')
				backBtn.setAttribute('class', 'asset slider-back')
				backBtn.style.top = ( (this.slider.box().height / 2) - 10) + 'px'
				backBtn.onclick = function(e) {
					e.preventDefault()
					e.stopPropagation()

					_self.prev()

					return false
				}

			var nextBtn = document.createElement('div')
				nextBtn.setAttribute('class', 'asset slider-next')
				nextBtn.style.top = ( (this.slider.box().height / 2) - 10) + 'px'
				nextBtn.style.left = ( this.slider.box().width + 15) + 'px'
				nextBtn.onclick = function(e) {
					e.preventDefault()
					e.stopPropagation()

					_self.next()

					return false
				}

			this.slider.parent().css('position', 'relative')
			this.slider.parent().append(backBtn)
			this.slider.parent().append(nextBtn)
			
			this.timer = setTimeout(function() { _self.next() }, this.switchTime)
		},
		next: function() {
			this.change(1)
		},
		prev: function() {
			this.change(-1)
		}, 
		change: function(val) {
			this.slides.eq(this.current).removeClass('active')

			this.current += val

			if(this.current < 0) this.current = this.slides.length - 1
			else if(this.current == this.slides.length) this.current = (val > 0) ? 0 : this.slides.length - 1

			this.slides.eq(this.current).addClass('active')

			_self = this

			clearTimeout(this.timer)
			this.timer = setTimeout(function() { _self.next() }, this.switchTime)
		}
	}

	return Slider

})
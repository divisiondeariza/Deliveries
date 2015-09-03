define(function(require) {

	function Scroll() {
		var events = []
		window.addEventListener('scroll', scrollFn)

		function scrollFn() {
			var scrOfX = 0, scrOfY = 0;

			if('scrollX' in window && 'scrollY' in window) {
				scrOfY = window.scrollY
				scrOfX = window.scrollX
			} else if( typeof( window.pageYOffset ) == 'number' ) {
			    //Netscape compliant
			    scrOfY = window.pageYOffset;
			    scrOfX = window.pageXOffset;
			} else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
			    //DOM compliant
			    scrOfY = document.body.scrollTop;
			    scrOfX = document.body.scrollLeft;
			} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
			    //IE6 standards compliant mode
			    scrOfY = document.documentElement.scrollTop;
			    scrOfX = document.documentElement.scrollLeft;
			}

			for(var i = 0; i < events.length; i++) {
				events[i]({top: scrOfY, left: scrOfX}) // Trigger al evento
			}
		}

		function add(ev) {
			events.push(ev)
		}

		return {
			add: add
		}
	}

	return new Scroll()
})
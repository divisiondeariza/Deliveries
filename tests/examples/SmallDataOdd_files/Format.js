define(function(require) {

	function Format() {
		// Devuelve un número en formato currency. E.g 1000 -> $1.000

		this.currency = function() {
			var c 		= app.currency.decimals;
			var d 		= app.currency.decimals_delimiters;
			var t 		= app.currency.thousands_delimiters;
			var before 	= app.currency.before;
			var after 	= app.currency.after;

			if(typeof arguments[1] == 'string') {
				arguments[4] = arguments[1]
			} else if(arguments[1] !== undefined) {
				var data = arguments[1];

				c = data.decimals;
				d = data.decimals_delimiter;
				t = data.thousands_delimiter;
				before = data.before;
				after = data.after;
			}

			var n = arguments[0],
				s = n < 0 ? "-" : "",
				i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
				j = (j = i.length) > 3 ? j % 3 : 0

   			return before + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + after;
		}

		return this
	}

	return new Format()
})
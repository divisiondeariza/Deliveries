/* Checks if a test element is an array */
define(function() {
	function isArray(test) {
		return Object.prototype.toString.call( test ) === '[object Array]' 
	}
	return isArray
})
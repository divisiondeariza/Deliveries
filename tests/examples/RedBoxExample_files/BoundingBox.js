// Devuelve el bounding box de un elemento cross-browser
define(function(require) {
	function BoundingBox(element) {
		boundingBox = element.getBoundingClientRect()

		width  = (boundingBox.width === undefined)  ? parseInt(boundingBox.right)  - parseInt(boundingBox.left) : boundingBox.width 
		height = (boundingBox.height === undefined) ? parseInt(boundingBox.bottom) - parseInt(boundingBox.top) : boundingBox.height 

		return { 
			width: width,
			height: height,
			top: boundingBox.top,
			left: boundingBox.left,
			right: boundingBox.right,
			bottom: boundingBox.bottom
		}
	}

	return BoundingBox
})
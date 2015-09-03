(function($) {
        $.fn.box = function() {
            var boundingBox = this[0].getBoundingClientRect()

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
        };

        $.ltrim = function( str ) {
            return str.replace( /^\s+/, "" );
        };
        $.serialize = function( obj ) {
            var serialize = []
            for(var i in obj) {
                serialize.push(i + '=' + escape(obj[i]))
            }
            return serialize.join('&')
        }
        $.rtrim = function( str ) {
            return str.replace( /\s+$/, "" );
        };
        $.fn.animEnd = function(callback) {
            return this.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', callback);
        }
        $.fn.value = function() {
            return this.val.apply(this, arguments);
        }
    }
)(jQuery);

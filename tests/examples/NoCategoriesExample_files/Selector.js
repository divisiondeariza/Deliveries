define(function(require) {
	var Sizzle = require('libs/sizzle.min')
	var BoundingBox  = require('Utils/BoundingBox');

	// Recibe un DOM element o string e implementa funciones basadas en jQuery
	function Selector() {
        this.initialize(arguments);
    }

    Selector.prototype = {
    	eventLinks: [],
    	Events: {},
    	el: [],
    	selector: null,
    	initialize: function(arguments) {
    		// Usualmente el argumento 1 si es un string, creo un objeto Sizzle
    		var searchElement = arguments[0];
    		var findIn		  = arguments[1] || undefined;

    		if(!isString(searchElement) && isElement(searchElement) && findIn === undefined) {
    			this.Events = {};
    			this.selector = searchElement;
				this.el = [searchElement];
				this.eventLinks = [];
				
				return this;
    		}

    		if(!isString(searchElement) && !isElement(searchElement)) {
	    		if('el' in searchElement) {
	    			searchElement = searchElement.el[0];
	    		}
			}

			if(findIn && !isString(findIn) && !isElement(findIn)) {
	    		if('el' in findIn) {
	    			findIn = findIn.el[0];
	    		}
			}

    		this.Events = {};
    		this.selector = searchElement;
			this.el = new Sizzle(searchElement, findIn);
			this.eventLinks = [];
		},
		find: function(element) {
			return new Selector(element, this.element());
		},
		eq: function(index) {
			if(this.el.length > index) {
				return new Selector(this.el[index])
			}

			return false;
		},	
		addClass: function(newClass) {
			for(var i = 0; i < this.el.length; i++) {
				exp = newClass.split(' ');
				for(var n in exp) {
					this.el[i].classList.add(exp[n]);
				}
			}

			return this;
		},
		removeClass: function(removeClass) {
			for(var i = 0; i < this.el.length; i++) {
				exp = removeClass.split(' ');
				for(var n in exp) {
					this.el[i].classList.remove(exp[n]);
				}
			}

			return this;
		},
		toggleClass: function(className) {
			for(var i = 0; i < this.el.length; i++) {
				exp = className.split(' ');
				for(var n in exp) {
					this.el[i].classList.toggle(exp[n]);
				}
			}

			return this;
		},
		hasClass: function(className) {
			hasIt = false
			
			if('classList' in document.body) {
				hasIt = this.el[0].classList.contains(className);
			} else hasIt = ( this.el[0].getAttribute('class').indexOf(className) > -1 );

			return hasIt;
		},
		animEnd: function(callback) {
			for(var i = 0; i < this.el.length; i++) {
				if(!PrefixedEvent(this.el[i], 'AnimationEnd', callback, this)) {
					// No support for animation end, trigger right away
					callback.apply(this, [])
				}
			}

			return this;
		},

		// Validates that the current set of elements matches a selector
		is: function(selector) {
			for(var i = 0; i < this.el.length; i++) {
				if(!Sizzle.matchesSelector(this.el[i], selector)) return false
			} return true
		},

		element: function() { return (this.el.length === 1) ? this.el[0] : this.el },

		/* Event functions */
		on: function(event, fn) {	
			var evts = event.split(' ');
			this.eventLinks.push(evts);

			for (var e = 0, iLen = evts.length; e<iLen; e++) {
				this.Events[evts[e]] = fn;
			}

			for (var i = 0; i < this.el.length; i++) {
				var self = this;
				var el = this.el[i];

				var eventObj = {
					handleEvent: function(e) {
						self.handleEvent(e, this)
					},
					el: el
				};

				for (var e = 0, iLen = evts.length; e<iLen; e++) {
					el.addEventListener(evts[e], eventObj, false);
				}
			}

			return this
		},

		one: function(event, _fn) {
			var _fn = _fn

			this.on(event, function(event) {
				event.srcElement.removeEventListener(event.type, this);
				this.deleteAll(event.type)
				_fn.apply(this, arguments) // Trigger the function
			})

			return this;
		},

		// Deletes all linked events
		deleteAll: function(type) {
			for(var i in this.eventLinks) {
				if(this.eventLinks[i].indexOf(type) !== -1) {
					for(var e in this.eventLinks[i]) {
						delete this.Events[this.eventLinks[i][e]]
					}
				}
			}
		},

		// Runs when an event is triggered
		handleEvent: function(event, trigger) {
			event = event || window.event;
			el = trigger.el;
			if(event.type in this.Events) {
				this.Events[event.type].apply(el, arguments)
			}
		},

		off: function(event) {
			if(event in this.Events) {
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].removeEventListener(event, this, false)
				}
				delete this.Events[event]
			}

			return this;
		},
		remove: function() {
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].parentNode.removeChild(this.el[i])
			}

			return true;
		},
		css: function(style_name, value) {
			var style_name = style_name || false;
			var value = value || false;
			
			if(style_name && value && isString(style_name)) {
				style_name = camelCase(style_name);
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].style[style_name] = value;
				}
			} else if(style_name && value === false) {
				if(isString(style_name)) {
					return this.el[0].style[camelCase(style_name)]
				} else {
					for(var i = 0; i < this.el.length; i++) {
						for(var this_value in style_name) {
							this.el[i].style[camelCase(this_value)] = style_name[this_value];
						}
					}
				}
			}

			return this;
		},
		value: function(set_value) {
			if(typeof set_value != undefined 
				&& set_value != null
				&& set_value != '') {
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].value = set_value;
				}
			} else {
				return this.el[0].value;
			}
		},
		attr: function(attribute_name, value) {
			var attribute_name = attribute_name || false;
			var value = value || false;

			if(attribute_name && value) {
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].setAttribute(attribute_name, value + '');
				}
			} else if(attribute_name && value === false) {
				if(typeof attribute_name == 'string') {
					return this.el[0].getAttribute(attribute_name + '');
				} else {
					for(var i = 0; i < this.el.length; i++) {
						for(var this_value in attribute_name) {
							this.el[i].setAttribute(this_value, attribute_name[this_value]);
						}
					}
				}
			}

			return this;
		},
		removeAttr: function(attribute_name) {
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].removeAttribute(attribute_name)
			}

			return this;
		},
		size: function() {
			return this.el.length
		},
		html: function(set_value) {
			var set_value = set_value || false;
			if(set_value) {
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].innerHTML = set_value;
				}
				return this;
			} else {
				return this.el[0].innerHTML;
			}
		},
		text: function(set_value) {
			var set_value = set_value || false;
			if(set_value) {
				for(var i = 0; i < this.el.length; i++) {
					this.el[i].textContent = set_value;
				}
				return this;
			} else {
				return this.el[0].textContent;
			}
		},
		show: function(type) {
			var type = type || 'block';
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].style.display = type;
			}
			return this;
		},
		hide: function() {
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].style.display = 'none';
			}
			return this;
		},
		box: function() {
			return BoundingBox(this.el[0])
		},
		clone: function() {
			return new Selector(this.el);
		},
		each: function(fn_apply) {
			for(var i = 0; i < this.el.length; i++) {
				fn_apply.apply(this.el[i], [i, this]);
			}
			return this;
		},
		parent: function() {
			return new Selector(this.el[0].parentNode);
		},
		append: function(element) {
			for(var i = 0; i < this.el.length; i++) {
                                
				this.el[i].appendChild(element);
                               
			}
			return this;
		},
		prepend: function(element) {
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].insertBefore(element, this.el[i].firstChild)
			}
			return this;
		},
		submit: function() {
			for(var i = 0; i < this.el.length; i++) {
				this.el[i].submit()
			}
			return this;
		},
		visible: function() {
			var box = this.box();

			if(box.width === 0) {
				return false;
			}

			var el_display = this.el[0].style.display;
			var display = getComputedStyle(this.el[0]).getPropertyValue('display');

			if(el_display !== '' && el_display === 'none' 
				|| display === 'none' && display !== '') {
				return false;
			}	

			return true;
		},
		parents: function(selector) {
			var parent = Parents(this.el[0], selector);
			if( parent !== [] ) {
				return new Selector(parent);
			}
			return false;
		}
	}

	var class2type = {};
	var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
	for(var i = 0; i < types.length; i++) {
    	class2type[ "[object " + types[i] + "]" ] = types[i].toLowerCase()
  	}

	function type(obj) {
//        return obj == null ? String(obj) :
//                class2type[toString.call(obj)] || "object";
            if (obj === null) {
                var object = String(obj);
            } else {
//                var userAgent = navigator.userAgent;
//                if (userAgent.indexOf("MSIE") !== -1) {
                    var _index = '[object '+(typeof obj).capitalize()+']';
//                }else{
//                    var _index = toString.call(obj);
//                }
                var object = class2type[_index] || "object";
            }
        return object;
        }

        String.prototype.capitalize = function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }

	function isFunction(value) { return type(value) == "function" }
	function isWindow(obj)     { return obj != null && obj == obj.window }
	function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
	function isObject(obj)     { return type(obj) == "object" }
	function isPlainObject(obj) {
	    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
	}
	function isString(value) { return type(value) == "string" }
	function likeArray(obj) { return typeof obj.length == 'number' }
	//Returns true if it is a DOM node
	function isNode(o) {
	  return (
	    typeof Node === "object" ? o instanceof Node : 
	    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	  );
	}
	//Returns true if it is a DOM element    
	function isElement(o) {
	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	}

	function camelCase(input) {
		if(input.match(/-(.)/g) === null) return input; 
  		return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
	        return group1.toUpperCase();
	    });
	}

	var pfx = ["webkit", "moz", "MS", "o", ""];
	function PrefixedEvent(element, type, callback, _this) {
		var support = false;
		var trigger = function(e) { 
			callback.apply(_this, []);
			// elimina todos los eventos de anim
			for (var p = 0; p < pfx.length; p++) {
				if (!pfx[p]) type = type.toLowerCase()
				if( this.style[ pfx[p]+'AnimationName' ] !== undefined ) {
					this.removeEventListener(pfx[p]+type, trigger, false)
				}
			}
		};

		for (var p = 0; p < pfx.length; p++) {
			if (!pfx[p]) type = type.toLowerCase()
			if( element.style[ pfx[p]+'AnimationName' ] !== undefined ) {
				support = true
				element.addEventListener(pfx[p]+type, trigger, false)
				break;
			}
		}

		return support
	}

	function Parents(element, find) {
		parents = getParents(element)
		// Loop para validar si el parent hace match con el find
		for(var i = 0; i < parents.length; i++) {
			if(Sizzle.matchesSelector(parents[i], find)) return parents[i]
		} 

		// No encontré nada..
		return []
	}

	function getParents(el) {
	    var parents = []
	    var p = el.parentNode
	    
	    while (p !== null) {
	        var o = p;
	        parents.push(o)
	        p = o.parentNode
	    }
	    return parents;
	}


	return Selector
})
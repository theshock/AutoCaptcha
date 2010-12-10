// ==UserScript==
// @name           AutoCaptcha
// @namespace      Shock
// @description    JavaScript automatic captcha filler
// @include        *
// ==/UserScript==

(function () {

(function () {
	var win, doc;
	var nano = function (arg, context) {
		if (nano.isNano(context)) {
			return context.find(arg);
		} else {
			return new Nano(arg, context || doc);
		}
	};
	nano.extend = function (elem, safe, from) {
		if (arguments.length == 2) {
			from = safe;
			safe = false;
		} else if (arguments.length == 1) {
			from = elem;
			elem = nano;
		}
		for (var i in from) {
			if (safe && i in elem) continue;
			elem[i] = from[i];
		}
		return elem;
	};
	nano.extend(nano, {
		setContext : function (newWindow) {
			win = newWindow;
			doc = win.document;
			win.nano = nano;
			return this;
		},
		getContext : function () {
			return win;
		},
		implement : function (elem, safe, from) {
			if (arguments.length == 2) {
				from = safe;
				safe = false;
			} else if (arguments.length == 1) {
				from = elem;
				elem = Nano;
			}
			nano.extend(elem.prototype, safe, from);
			return elem;
		},
		deepEquals : function (first, second) {
			for (var i in first) {
				var f = first[i], s = second[i];
				if (typeof f == 'object') {
					if (!s || !nano.deepEquals(f, s)) return false;
				} else if (f != s) {
					return false;
				}
			}

			for (var k in second) {
				if (!(k in first)) return false;
			}

			return true;
		},
		find : function (In, selector) {
			if (!selector) return [In];

			var toArray = nano.toArray;
			if (typeof selector == 'string') {
				return toArray(In.querySelectorAll(selector));
			} else if (selector.nodeName) {
				return [selector];
			} else if (selector.id) {
				return [In.getElementById(selector.id)];
			} else if (selector.tag) {
				return toArray(In.getElementsByTagName(selector.tag));
			} else if (selector.Class) {
				return toArray(In.getElementsByClassName(selector.Class));
			} else {
				return [In];
			}
		},
		toArray : function (elem) {
			return Array.prototype.slice.call(elem);
		},
		unique: function (array) {
			var tmp = [];
			for (var i = 0; i < array.length; i++) if (i in array) {
				if (!nano.contains(tmp, array[i])) {
					tmp.push(array[i]);
				}
			}
			return tmp;
		},
		setter : function (args) {
			if (args.length == 1 && typeof args[0] == 'object') {
				return args[0];
			} else if (args.length == 1) {
				return args[0];
			} else {
				var r = {};
				r[args[0]] = args[1];
				return r;
			}
		},
		contains : function (array, elem) {
			for (var i = array.length; i--;) if (i in array) {
				 if (elem === array[i]) return true;
			}
			return false;
		},
		log : function () {
			var c = win.console;
			if (c && c.log) {
				return c.log.apply(c, arguments);
			} else return false;
		},
		isNano : function (elem) {
			return elem && elem instanceof Nano;
		}
	});

	var Nano = function (arg, In) {
		if (!arguments.length) {
			this.elems = [doc];
		} else if (nano.isNano(arg)) {
			this.elems = arg.elems;
		} else if (typeof arg == 'function') {
			this.elems = [In];
			this.ready(arg);
		} else if (arg instanceof Array) {
			this.elems = arg;
		} else if (arg instanceof HTMLCollection) {
			this.elems = nano.toArray(arg);
		} else {
			this.elems = nano.find(In, arg);
		}
		return this;
	};

	nano.implement(Nano, {
		get : function (index) {
			return this.elems[index * 1 || 0];
		},
		create : function (tagName, index, attr) {
			if (typeof index == 'object') {
				attr  = index;
				index = 0;
			}
			var elem = nano(this.get(index).createElement(tagName));
			if (attr) elem.attr(attr);
			return elem;
		},
		each : function (fn) {
			this.elems.forEach(fn.bind(this));
			return this;
		},
		attr : function (attr) {
			attr = nano.setter(arguments);
			if (typeof attr[0] == 'string') {
				return this.get().getAttribute(attr[0]);
			}
			return this.each(function (elem) {
				nano.extend(elem, attr);
			});
		},
		css : function (css) {
			css = nano.setter(arguments);
			if (typeof css[0] == 'string') {
				return this.get().style[css[0]];
			}
			return this.each(function (elem) {
				nano.extend(elem.style, css);
			});
		},
		bind : function () {
			var events = nano.setter(arguments);
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					elem.addEventListener(i, events[i].bind(this), false);
				}
			}.bind(this));
		},
		delegate : function (tagName, event, fn) {
			return this.bind(event, function (e) {
				if (e.target.tagName.toLowerCase() == tagName.toLowerCase()) {
					fn.apply(this, arguments);
				}
			});
		},
		ready : function (full, fn) {
			if (arguments.length == 1) {
				fn   = full;
				full = false;
			}
			return this.bind(full ? 'load' : 'DOMContentLoaded', fn);
		},
		find : function (selector) {
			var result = [];
			this.each(function (elem) {
				result = result.concat(nano.find(elem, selector));
			});
			return nano(nano.unique(result));
		},
		log : function () {
			nano.log.apply(nano, arguments.length ? arguments : ['nano', this.elems]);
			return this;
		},
		appendTo : function (to) {
			to = nano(to).get();
			return this.each(function (elem) {
				to.appendChild(elem);
			});
		},
		destroy : function () {
			return this.each(function (elem) {
				elem.parentNode.removeChild(elem);
			});
		}
	});

	nano.extend({
		rich : function () {
			nano.implement(Number, 'safe', {
				between: function (n1, n2, equals) {
					return (n1 <= n2) && (
						(equals == 'L'   && this == n1) ||
						(equals == 'R'   && this == n2) ||
						(  this  > n1    && this  < n2) ||
						([true, 'LR', 'RL'].contains(equals) && (n1 == this || n2 == this))
					);
				},
				equals : function (to, accuracy) {
					if (arguments.length == 1) accuracy = 8;
					return this.toFixed(accuracy) == to.toFixed(accuracy);
				}
			});

			nano.implement(Array, 'safe', {
				contains : function (elem) {
					return nano.contains(this, elem);
				}
			});
		}
	});

	nano.setContext(window);
})();

(function () {
	// JavaScript 1.8.5 Compatiblity

	nano.implement(Function, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
		bind : function(context /*, arg1, arg2... */) {
			'use strict';
			if (typeof this !== 'function') throw new TypeError();
			var _slice = Array.prototype.slice,
				_concat = Array.prototype.concat,
				_arguments = _slice.call(arguments, 1),
				_this = this,
				_function = function() {
					return _this.apply(this instanceof _dummy ? this : context,
						_concat.call(_arguments, _slice.call(arguments, 0)));
				},
				_dummy = function() {};
			_dummy.prototype = _this.prototype;
			_function.prototype = new _dummy();
			return _function;
		}
	});

	nano.extend(Object, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
		keys : function(o) {
			var result = [];
			for(var name in o) {
				if (o.hasOwnProperty(name))
				  result.push(name);
			}
			return result;
		}
	});

	nano.extend(Array, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
		isArray : Array.isArray || function(o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		}
	});
})();


var AutoCaptcha = (function () {

	nano.rich();

	var AutoCaptcha = nano.implement(
		function (image) {
			this.picture = new Picture(image);
		}, {
			read : function () {
				try {
					AutoCaptcha.lastReaded = new Reader(this.picture).get();
					this.log('Капча прочитана: <code>' + AutoCaptcha.lastReaded + '</code>');
				} catch (e) {
					this.log('Не удалось прочитать капчу(', true);
				}
			},
			logWrapper : null,
			getLogWrapper : function () {
				if (!AutoCaptcha.logWrapper) {
					AutoCaptcha.logWrapper = nano().create('div').css({
						position : 'absolute',
						right : '10px',
						top   : '10px'
					}).appendTo('body');
				}
				return AutoCaptcha.logWrapper;
			},
			log : function (msg, fail) {
				var log = nano().create('div', {
					innerHTML : msg,
				})
				.css({
					background : '#cfc',
					border     : '1px solid #090',
					color      : '#090',

					font : '12px sans-serif',

					width : '200px',
					padding : '5px 15px',
					margin  : '1px',

					textAlign : 'center'
				})
				.appendTo(this.getLogWrapper());

				if (fail) log.css({
					background  : '#fee',
					borderColor : '#900',
					color       : '#900'
				});

				log.find('code').css('fontWeight', 'bold');

				setTimeout(function () {
					log.destroy();
				}, 2500);
			}
		}
	);

	return nano.extend(AutoCaptcha, {
		logWrapper : null,
		lastReaded : null,
	});
})();

var Picture = (function () {
	var Color = function (r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = arguments.length < 4 ? 255 : a;
	};

	var round = Math.round;

	var Picture = nano.implement(
		function (canvas) {
			this.canvas = Picture.imageToCanvas(canvas);
			this.ctx    = this.canvas.getContext('2d');
		}, {
			getCropped : function (x, y, width, height) {
				var canvas = nano().create('canvas', {
					width : width, height : height
				}).get();
				canvas.getContext('2d').drawImage(this.canvas,
					x, y, width, height, /* crop From */
					0, 0, width, height  /* draw To*/
				);
				return canvas;
			},
			getColors : function () {
				return this.getPixelsCallback(function (r,g,b,a) {
					return new Color(r,g,b,a);
				});
			},
			getLuminance : function () {
				return this.getPixelsCallback(Picture.luminance);
			},
			getThreshold : function (min, max) {
				return this.getPixelsCallback(
					Picture.threshold.bind(Picture, min, max)
				);
			},
			getPixelsCallback : function (fn) {
				var c = this.canvas, w = c.width, h = c.height;
				try {
					var pix = this.ctx.getImageData(0,0,w,h).data;
				} catch (e) {
					console.error(e);
				}
				var all = {}, x, y;
				for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
					if (!(y in all)) all[y] = {};

					var i = x*4 + y*4*w;
					all[y][x] = fn(pix[i], pix[i+1], pix[i+2], pix[i+3]);
				}
				return all;
			}
		}
	);

	return nano.extend(Picture, {
		isCanvas : function (elem) {
			return elem.tagName.toLowerCase() == 'canvas';
		},
		isImg : function (elem) {
			return elem.tagName.toLowerCase() == 'img';
		},
		imageToCanvas : function (elem) {
			if (Picture.isCanvas(elem)) {
				return elem;
			} else if (Picture.isImg(elem)) {
				var canvas = nano().create('canvas', {
						width  : elem.width,
						height : elem.height
					}).get();
				canvas.getContext('2d').drawImage(elem, 0, 0);
				return canvas;
			} else {
				throw 'NotImage';
			}
		},
		luminance : function (r, g, b) {
			return round((r * 3 + g * 6 + b * 1) * 0.1);
		},
		threshold : function (min, max, r, g, b) {
			min = min || min === 0 ? min : 127;
			max = max || max === 0 ? max : 255;
			// it can't be less, than min
			max = Math.max(min, max);
			return Picture.luminance(r, g, b)
				.between(min, max, true) ? 1 : 0;
		}
	});
})();

var Reader = (function () {

	var min = Math.min;
	var max = Math.max;

	// Sumbols mask
	var symTpls = {
		0: {"0":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":1,"6":1,"7":1},"1":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"2":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"3":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"4":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"8":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"9":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":1,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		1: {"0":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"1":{"0":1,"1":0,"2":0,"3":0,"4":1,"5":1},"2":{"0":0,"1":0,"2":0,"3":0,"4":1,"5":1},"3":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"4":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"5":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"6":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"7":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"8":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1},"9":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1}},
		2: {"0":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"1":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"4":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"5":{"0":1,"1":1,"2":1,"3":1,"4":0,"5":0,"6":1,"7":1},"6":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":1,"6":1,"7":1},"7":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":1,"7":1},"9":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		3: {"0":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"1":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"4":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":0,"6":1,"7":1},"5":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"6":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		4: {"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"1":{"0":1,"1":1,"2":1,"3":1,"4":0,"5":0,"6":0,"7":1},"2":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":0,"6":0,"7":1},"3":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":0,"6":0,"7":1},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"6":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"7":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"8":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		5: {"0":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1},"1":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"3":{"0":0,"1":0,"2":1,"3":0,"4":0,"5":0,"6":1,"7":1},"4":{"0":0,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"5":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		6: {"0":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"1":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1},"3":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"4":{"0":0,"1":0,"2":1,"3":0,"4":0,"5":0,"6":1,"7":1},"5":{"0":0,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		7: {"0":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"1":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":0,"6":0,"7":1},"4":{"0":1,"1":1,"2":1,"3":1,"4":0,"5":0,"6":1,"7":1},"5":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":1,"6":1,"7":1},"6":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"7":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":1,"7":1},"8":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"9":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		8: {"0":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"1":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"4":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"5":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		9: {"0":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"1":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":0},"5":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0},"6":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		a: {"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"1":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"3":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":0,"7":0},"5":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":0,"6":0,"7":0},"9":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		b: {"0":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"1":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"2":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"3":{"0":0,"1":0,"2":1,"3":0,"4":0,"5":0,"6":1,"7":1},"4":{"0":0,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":0,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"9":{"0":0,"1":0,"2":1,"3":0,"4":0,"5":0,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		c: {"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"1":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"3":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":0,"7":0},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":0,"7":0},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		d: {"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"1":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":0},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":0},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		e: {"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"1":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"2":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"3":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"4":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":1},"5":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":0},"6":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"7":{"0":0,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1},"8":{"0":1,"1":0,"2":0,"3":1,"4":1,"5":1,"6":0,"7":0},"9":{"0":1,"1":1,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}},
		f: {"0":{"0":1,"1":1,"2":1,"3":0,"4":0,"5":0,"6":0,"7":1},"1":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":0,"7":0},"2":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":0,"7":0},"3":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"4":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"5":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1},"6":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"7":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"8":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"9":{"0":1,"1":1,"2":0,"3":0,"4":1,"5":1,"6":1,"7":1},"10":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1}}
	};

	return nano.implement(
		function (picture) {
			this.picture = picture;
		}, {
			get : function () {
				var thr = this.picture.getThreshold(130, 256);
				var yFrom = null, yTo = null;
				var xFrom = null, xTo = null;
				var x, y;

				// cut empty spaces
				for (y in thr) for (x in thr[y]) {
					if (!thr[y][x]) {
						xFrom = xFrom === null ? x : min(x, xFrom);
						yFrom = yFrom === null ? x : min(y, yFrom);
						xTo   = max(x, xTo);
						yTo   = max(y, yTo);
					}
				}
				var cropped = new Picture(
					this.picture
						.getCropped(xFrom-1, yFrom, xTo-xFrom+3, yTo-yFrom+2)
				);

				thr = cropped.getThreshold(130, 256);

				// split symbols and push its mask to array
				var symbols = [];
				var start   = null;
				for (x in thr[0]) {
					if (this.isColumnEmpty(thr, x)) {
						if (start !== null) {
							var symbolImg = cropped.getCropped(start, 0, x - start, cropped.canvas.height);
							symbols.push(new Picture(symbolImg).getThreshold(130, 256));
						}
						start = null;
					} else {
						if (start === null) start = x * 1;
					}
				}

				// try to find right symbols
				var result = '';
				symbols.forEach(function (sym, i) {
					for (var k in symTpls) {
						if (nano.deepEquals(symTpls[k], sym)) {
							result += k;
							return;
						}
					}
					throw 'Fail';
				});

				return result;
			},
			isColumnEmpty : function (thr, x) {
				for (var y in thr) {
					if (!thr[y][x]) return false;
				}
				return true;
			}
		}
	);

})();

nano().ready(true, function () {
	nano.setContext(unsafeWindow);

	nano()
		.delegate('img', 'dblclick', function (e) {
			new AutoCaptcha(e.target).read();
		})
		.delegate('input', 'dblclick', function (e) {
			if (AutoCaptcha.lastReaded) {
				e.target.value = AutoCaptcha.lastReaded;
			}
		});
});

})();
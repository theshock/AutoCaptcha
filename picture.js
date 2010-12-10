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
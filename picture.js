(function () {

var Color = function (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
};

var round = Math.round;

var Picture = nano.implement(
	function (canvas) {
		this.canvas = Picture.imageToCanvas(canvas);
		this.canvas.ctx = this.canvas.getContext('2d');
	}, {
		getColors : function () {
			return this.getPixelsCallback(function (r,g,b,a) {
				return new Color(r,g,b,a);
			});
		},
		getLuminance : function () {
			return this.getPixelsCallback(Picture.luminance);
		},
		getThreshold : function (thresholdMin, thresholdMax) {
			return this.getPixelsCallback(
				Picture.threshold.bind(Picture, thresholdMin, thresholdMax)
			);
		},
		getPixelsCallback : function (fn) {
			var c = this.canvas, w = c.width, h = c.height;
			var pix = c.ctx.getImageData(0,0,w,h).data;
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

window.Picture = nano.extend(Picture, {
	isCanvas : function (elem) {
		return elem instanceof HTMLCanvasElement;
	},
	isImg : function (elem) {
		return elem instanceof HTMLImageElement;
	},
	imageToCanvas : function (elem) {
		if (Picture.isCanvas(elem)) {
			return elem;
		} else if (Picture.isImg(elem)) {
			var canvas = nano().create('canvas').get();
			canvas.width  = elem.width;
			canvas.height = elem.height;
			canvas.getContext('2d').drawImage(elem, 0, 0);
			return canvas;
		} else {
			nano.log('NotImageException: ', elem);
			throw 'NotImage';
		}
	},
	luminance : function (r, g, b) {
		return round((r * 3 + g * 6 + b * 1) * 0.1);
	},
	threshold : function (thresholdMin, thresholdMax, r, g, b) {
		var L = Picture.luminance(r, g, b);
		return L > (thresholdMin || 127) && L <= (thresholdMax || 255) ? 1 : 0;
	}
});

})();


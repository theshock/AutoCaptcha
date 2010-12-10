(function () {

var Color = function (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
};

var Picture = function (canvas) {
	this.canvas = picture.imageToCanvas(canvas);
	this.canvas.ctx = this.canvas.getContext('2d');
};

var INVERT_2550 = 1/2550;

Picture.prototype = {
	getColors : function () {
		return this.getPixelsCallback(function (r,g,b,a) {
			return new Color(r,g,b,a);
		});
	},
	getLuminance : function (asFloat) {
		var round = Math.round;
		return this.getPixelsCallback(function (r,g,b,a) {
			var color = (r * 3 + g * 6 + b * 1);
			return (asFloat) ? color * INVERT_2550 : round(color * 0.1);
		});
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
};

var picture = function (canvas) {
	return new Picture(canvas);
};

picture.isCanvas = function (elem) {
	return elem instanceof HTMLCanvasElement;
};

picture.isImg = function (elem) {
	return elem instanceof HTMLImageElement;
};

picture.imageToCanvas = function (elem) {
	if (picture.isCanvas(elem)) {
		return elem;
	} else if (picture.isImg(elem)) {
		var canvas = nano().create('canvas').get();
		canvas.width  = elem.width;
		canvas.height = elem.height;
		canvas.getContext('2d').drawImage(elem, 0, 0);
		return canvas;
	} else {
		nano.log('NotImageException: ', elem);
		throw 'NotImage';
	}
};

picture.fn = Picture.prototype;

window.picture = picture;

})();
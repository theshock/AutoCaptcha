(function () {

var Reader = nano.implement(
	function (picture) {
		this.picture = picture;
	}, {
		get : function () {
			return Math.random();
		}
	}
);

var AutoCaptcha = nano.implement(
	function (image) {
		this.picture = new Picture(image);
	}, {
		read : function () {
			AutoCaptcha.lastReaded = new Reader(this.picture).get();
			nano.log('AutoCaptcha read: ' + AutoCaptcha.lastReaded);
		}
	}
);

window.AutoCaptcha = nano.extend(AutoCaptcha, {
	lastReaded : null,
});

nano().delegate('input', 'dblclick', function (e) {
	if (AutoCaptcha.lastReaded) {
		e.target.value = AutoCaptcha.lastReaded;
	}
});

})();
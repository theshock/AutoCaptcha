nano().ready(true, function () {
	setInterval(function () {
		nano('input').each(function (input) {
			var real = input.getAttribute('real');
			var val  = input.value;
			if (!val) {
				input.className = '';
			} else if (real == val) {
				input.className = 'right';
			} else {
				input.className = 'wrong';
			}
		});
	}, 250);

	nano().delegate('img', 'dblclick', function (e) {
		new AutoCaptcha(e.target).read();
	});
});
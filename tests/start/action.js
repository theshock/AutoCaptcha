
if (window.fireunit) {
	//fireunit.testDone();
}

nano().ready(true, function () {
	var l = new Picture(this.find('img').get()).getLuminance();
	var lines = [], round = Math.round;
	var box = function (l) {
		return '█▓▒░ '[parseInt(l / 256 * 5)];
	};
	for (var y in l) for (var x in l[y]) {
		if (!lines[y]) lines[y] = '';
		lines[y] += box(l[y][x]);
	}
	nano('body').get().innerHTML = '<p>' + lines.join('<p>').replace(/\ /g, '&nbsp;');
});
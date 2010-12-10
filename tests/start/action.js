
if (window.fireunit) {
	//fireunit.testDone();
}

nano().ready(true, function () {
	var img = this.find('img').get();
	var pix = new Picture(img).getThreshold(80);
	var lines = [];
	for (var y in pix) for (var x in pix[y]) {
		if (!lines[y]) lines[y] = '';
		lines[y] += '.█'[pix[y][x]];
	}
	nano('body').get().innerHTML = '<p>' + lines.join('<p>');
});
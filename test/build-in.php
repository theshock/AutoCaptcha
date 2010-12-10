<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>Captcha breaker</title>
		<style>
body { background : #eaeee0; }
li {
	list-style : none;
	background  : #ccc;
	border  : 2px outset #ccc;
	margin  : 12px;
	padding : 2px;
	float   : left;
}
input {
	display    : block;
	background : #ccf;
	color   : black;
	border  : 2px inset #ccc;
	width   : 146px;
	font    : 16px monospace;
	padding : 2px;
	margin  : 4px;
}
input.right {
	background : #cfc;
}
input.wrong {
	background : #fcc;
}
img {
	border  : 2px inset #ccc;
	display : block;
	margin : 4px;
}
p {
	font-family : monospace;
	line-height : 10px;
	margin : 0;
	padding : 0;
}
canvas {
	border : 1px solid red;
	padding : 1px;
}
		</style>
	</head>
	<body>
		<div class="log"></div>
		Auto captcha:
		<ul>
<? for ($i = 25; $i--;): $val = substr(md5(microtime(1) . rand()), 0, 8); ?>
			<li>
				<img src="captcha.php?value=<?= $val ?>" alt="Captcha" />
				<input type="text" real="<?= $val?>" maxlength="8" value="" />
			</li>
<? endfor; ?>
		</ul>

	</body>
	<script src="../nano.js"></script>
	<script src="../autoCaptcha.js"></script>
	<script src="../picture.js"></script>
	<script src="../reader.js"></script>
	<script>
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
});

nano().ready(true, function () {
	// nano.setContext(unsafeWindow);

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
	</script>
</html>

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
		</style>
	</head>
	<body>
		Captcha breaker:
		<ul>
<? for ($i = 2; $i--;): $val = substr(md5(microtime(1) . rand()), 0, 8); ?>
			<li>
				<img src="captcha.php?value=<?= $val ?>" alt="Captcha" width="150" height="30" />
				<input type="text" real="<?= $val?>" maxlength="8" value="" />
			</li>
<? endfor; ?>
		</ul>

	</body>
	<script src="../../../nano/nano.js"></script>
	<script src="../../picture.js"></script>
	<script src="../../autoCaptcha.js"></script>
	<script src="action.js"></script>
</html>

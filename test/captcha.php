<?php

$val = isset($_GET['value']) ? $_GET['value'] : '00000000';


header("Content-type: image/png");
$width  = 150;
$height = 30;
$img   = ImageCreate($width, $height);
$white = ImageColorAllocate($img, 255, 255, 255);
$rand  = function ($light = false) {
	return $light ? rand(132, 192) : rand(1, 127);
};

$noisePoints = $width * $height * 0.5;
$noiseColors = array();
for ($i = 100; $i--;) {
	$noiseColors[] = ImageColorAllocate($img, $rand(1), $rand(1), $rand(1));
}
while ($noisePoints-- > 0) {
	$noiseColor = $noiseColors[array_rand($noiseColors)];
    ImageSetPixel($img, rand(0, $width), rand(0, $height), $noiseColor);
}

$font = ImageColorAllocate($img, $rand(), $rand(), $rand());
ImageFill($img, 0, 0, $white);
ImageString($img, 5, rand(5, 75), rand(1, 14), $val, $font);
ImagePng($img);
ImageDestroy($img);
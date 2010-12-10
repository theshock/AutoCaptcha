<?php

$val = isset($_GET['value']) ? $_GET['value'] : '00000000';

header("Content-type: image/png");
$img   = imagecreate(150, 30);
$white = ImageColorAllocate($img, 255, 255, 255);
$rand  = function () { return rand(0, 192); };
$green = ImageColorAllocate($img, $rand(), $rand(), $rand());
ImageFill($img, 0, 0, $white);
ImageString($img, 5, rand(5, 75), rand(0, 15), $val, $green);
ImagePng($img);
ImageDestroy($img);
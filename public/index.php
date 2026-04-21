<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

if (PHP_SAPI === 'cli-server') {
    $_SERVER['APP_ENV'] ??= 'local';
    $_SERVER['APP_DEBUG'] ??= true;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
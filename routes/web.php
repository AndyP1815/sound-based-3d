<?php

use App\Http\Controllers\Sound3DController;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/sound', Sound3DController::class);

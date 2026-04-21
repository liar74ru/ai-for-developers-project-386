<?php

use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminEventTypeController;
use App\Http\Controllers\GuestBookingController;
use App\Http\Controllers\GuestEventTypeController;
use Illuminate\Support\Facades\Route;

// Admin API
Route::prefix('admin')->group(function () {
    Route::get('/event-types', [AdminEventTypeController::class, 'index']);
    Route::post('/event-types', [AdminEventTypeController::class, 'store']);
    Route::get('/event-types/{id}', [AdminEventTypeController::class, 'show']);
    Route::put('/event-types/{id}', [AdminEventTypeController::class, 'update']);
    Route::delete('/event-types/{id}', [AdminEventTypeController::class, 'destroy']);
    Route::get('/bookings', [AdminBookingController::class, 'index']);
});

// Guest API
Route::prefix('guest')->group(function () {
    Route::get('/event-types', [GuestEventTypeController::class, 'index']);
    Route::get('/event-types/{id}/slots', [GuestEventTypeController::class, 'slots']);
    Route::post('/bookings', [GuestBookingController::class, 'store']);
});

// SPA fallback — must be last
Route::get('/{any}', fn() => view('app'))->where('any', '.*');

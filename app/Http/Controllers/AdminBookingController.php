<?php

namespace App\Http\Controllers;

use App\Services\BookingStore;
use Illuminate\Http\JsonResponse;

class AdminBookingController
{
    public function __construct(private readonly BookingStore $store) {}

    public function index(): JsonResponse
    {
        return response()->json($this->store->upcomingBookings());
    }
}

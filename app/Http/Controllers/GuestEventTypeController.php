<?php

namespace App\Http\Controllers;

use App\Services\BookingStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestEventTypeController
{
    public function __construct(private readonly BookingStore $store) {}

    public function index(): JsonResponse
    {
        return response()->json($this->store->allEventTypes());
    }

    public function slots(Request $request, string $id): JsonResponse
    {
        $eventType = $this->store->findEventType($id);
        if (!$eventType) {
            return response()->json(['message' => 'Тип события не найден'], 404);
        }

        $timeFormat = $request->query('timeFormat', '24h');
        if (!in_array($timeFormat, ['12h', '24h'], true)) {
            $timeFormat = '24h';
        }

        return response()->json($this->store->generateSlots($eventType, $timeFormat));
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\BookingStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestBookingController
{
    public function __construct(private readonly BookingStore $store) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->json()->all();

        if (empty($data['eventTypeId']) || empty($data['startTime'])) {
            return response()->json(['message' => 'eventTypeId и startTime обязательны'], 400);
        }

        $eventType = $this->store->findEventType($data['eventTypeId']);
        if (!$eventType) {
            return response()->json(['message' => 'Тип события не найден'], 404);
        }

        try {
            $startTime = new \DateTimeImmutable($data['startTime'], new \DateTimeZone('UTC'));
        } catch (\Exception) {
            return response()->json(['message' => 'Неверный формат startTime'], 400);
        }

        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $maxDate = $now->modify('+14 days');
        if ($startTime < $now || $startTime > $maxDate) {
            return response()->json(['message' => 'Время должно быть в пределах ближайших 14 дней'], 400);
        }

        if (!$this->isValidSlotTime($startTime, $eventType['durationMinutes'])) {
            return response()->json(['message' => 'Время не соответствует доступному слоту'], 400);
        }

        $normalizedStart = $startTime->format('Y-m-d\TH:i:s\Z');
        if ($this->store->isSlotTaken($normalizedStart)) {
            return response()->json(['message' => 'Слот уже занят'], 409);
        }

        $booking = $this->store->createBooking([
            'eventTypeId' => $data['eventTypeId'],
            'startTime'   => $normalizedStart,
            'guestName'   => $data['guestName'] ?? null,
            'guestEmail'  => $data['guestEmail'] ?? null,
        ]);

        return response()->json($booking, 201);
    }

    private function isValidSlotTime(\DateTimeImmutable $startTime, int $durationMinutes): bool
    {
        $hour = (int) $startTime->format('H');
        $minute = (int) $startTime->format('i');
        $second = (int) $startTime->format('s');

        if ($second !== 0) {
            return false;
        }
        if ($hour < 9 || $hour >= 18) {
            return false;
        }

        $minutesFromStart = ($hour - 9) * 60 + $minute;
        if ($minutesFromStart % $durationMinutes !== 0) {
            return false;
        }

        $endMinutes = $minutesFromStart + $durationMinutes;
        return $endMinutes <= 9 * 60; // max 9 hours of workday (09:00+9h = 18:00)
    }
}

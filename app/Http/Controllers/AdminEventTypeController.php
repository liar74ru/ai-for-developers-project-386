<?php

namespace App\Http\Controllers;

use App\Services\BookingStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class AdminEventTypeController
{
    public function __construct(private readonly BookingStore $store) {}

    public function index(): JsonResponse
    {
        return response()->json($this->store->allEventTypes());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->json()->all();
        $errors = $this->validateInput($data);
        if ($errors) {
            return response()->json(['message' => $errors], 400);
        }
        return response()->json($this->store->createEventType($data), 201);
    }

    public function show(string $id): JsonResponse
    {
        $record = $this->store->findEventType($id);
        if (!$record) {
            return response()->json(['message' => 'Тип события не найден'], 404);
        }
        return response()->json($record);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $data = $request->json()->all();
        $errors = $this->validateInput($data);
        if ($errors) {
            return response()->json(['message' => $errors], 400);
        }
        $record = $this->store->updateEventType($id, $data);
        if (!$record) {
            return response()->json(['message' => 'Тип события не найден'], 404);
        }
        return response()->json($record);
    }

    public function destroy(string $id): JsonResponse
    {
        if (!$this->store->deleteEventType($id)) {
            return response()->json(['message' => 'Тип события не найден'], 404);
        }
        return response()->json(null, 204);
    }

    private function validateInput(array $data): ?string
    {
        if (empty($data['name'])) {
            return 'Поле name обязательно';
        }
        if (!array_key_exists('description', $data)) {
            return 'Поле description обязательно';
        }
        if (empty($data['durationMinutes']) || (int) $data['durationMinutes'] <= 0) {
            return 'durationMinutes должен быть положительным числом';
        }
        return null;
    }
}

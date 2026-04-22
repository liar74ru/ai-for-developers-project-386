<?php

namespace Database\Seeders;

use App\Services\BookingStore;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $store = app(BookingStore::class);

        if (!empty($store->allEventTypes())) {
            return;
        }

        $store->createEventType([
            'name'            => 'Встреча 15 минут',
            'description'     => 'Короткий тип события для быстрого слота.',
            'durationMinutes' => 15,
        ]);

        $store->createEventType([
            'name'            => 'Встреча 30 минут',
            'description'     => 'Базовый тип события для бронирования.',
            'durationMinutes' => 30,
        ]);
    }
}

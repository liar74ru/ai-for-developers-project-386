<?php

namespace App\Services;

use Illuminate\Support\Str;

class BookingStore
{
    private string $path;
    private array $data;

    public function __construct()
    {
        $this->path = storage_path('app/booking-data.json');
        $this->load();
    }

    // ── EventTypes ────────────────────────────────────────────────────────────

    public function allEventTypes(): array
    {
        return array_values($this->data['eventTypes']);
    }

    public function findEventType(string $id): ?array
    {
        return $this->data['eventTypes'][$id] ?? null;
    }

    public function createEventType(array $input): array
    {
        $record = [
            'id'              => (string) Str::uuid(),
            'name'            => $input['name'],
            'description'     => $input['description'],
            'durationMinutes' => (int) $input['durationMinutes'],
        ];
        $this->data['eventTypes'][$record['id']] = $record;
        $this->save();
        return $record;
    }

    public function updateEventType(string $id, array $input): ?array
    {
        if (!isset($this->data['eventTypes'][$id])) {
            return null;
        }
        $this->data['eventTypes'][$id] = [
            'id'              => $id,
            'name'            => $input['name'],
            'description'     => $input['description'],
            'durationMinutes' => (int) $input['durationMinutes'],
        ];
        $this->save();
        return $this->data['eventTypes'][$id];
    }

    public function deleteEventType(string $id): bool
    {
        if (!isset($this->data['eventTypes'][$id])) {
            return false;
        }
        unset($this->data['eventTypes'][$id]);
        $this->save();
        return true;
    }

    // ── Bookings ──────────────────────────────────────────────────────────────

    /** All upcoming bookings sorted by startTime ASC */
    public function upcomingBookings(): array
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $bookings = array_values(array_filter(
            $this->data['bookings'],
            fn($b) => new \DateTimeImmutable($b['startTime']) >= $now
        ));
        usort($bookings, fn($a, $b) => strcmp($a['startTime'], $b['startTime']));
        return $bookings;
    }

    public function createBooking(array $input): array
    {
        $record = [
            'id'          => (string) Str::uuid(),
            'eventTypeId' => $input['eventTypeId'],
            'guestName'   => $input['guestName'] ?? null,
            'guestEmail'  => $input['guestEmail'] ?? null,
            'startTime'   => $input['startTime'],
            'createdAt'   => (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z'),
        ];
        $this->data['bookings'][$record['id']] = $record;
        $this->save();
        return $record;
    }

    public function isSlotTaken(string $startTime): bool
    {
        foreach ($this->data['bookings'] as $b) {
            if ($b['startTime'] === $startTime) {
                return true;
            }
        }
        return false;
    }

    // ── Slots ─────────────────────────────────────────────────────────────────

    /** Generate all slots for an event type over the next 14 days (09:00–18:00 UTC) */
    public function generateSlots(array $eventType, string $timeFormat = '24h'): array
    {
        $slots = [];
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $duration = (int) $eventType['durationMinutes'];

        for ($day = 0; $day < 14; $day++) {
            $date = $now->modify("+{$day} days")->setTime(9, 0, 0);
            $endOfWorkday = $now->modify("+{$day} days")->setTime(18, 0, 0);

            $current = $date;
            while ($current < $endOfWorkday) {
                $end = $current->modify("+{$duration} minutes");
                if ($end > $endOfWorkday) {
                    break;
                }
                if ($current <= $now) {
                    $current = $end;
                    continue;
                }
                $startIso = $current->format('Y-m-d\TH:i:s\Z');
                $slots[] = [
                    'startTime'   => $startIso,
                    'endTime'     => $end->format('Y-m-d\TH:i:s\Z'),
                    'available'   => !$this->isSlotTaken($startIso),
                    'displayTime' => $this->formatDisplayTime($current, $timeFormat),
                ];
                $current = $end;
            }
        }

        return $slots;
    }

    private function formatDisplayTime(\DateTimeImmutable $dt, string $format): string
    {
        if ($format === '12h') {
            $h = (int) $dt->format('G');
            $m = $dt->format('i');
            $period = $h < 12 ? 'AM' : 'PM';
            $h12 = $h % 12 ?: 12;
            return "{$h12}:{$m} {$period}";
        }
        return $dt->format('H:i');
    }

    // ── Persistence ───────────────────────────────────────────────────────────

    private function load(): void
    {
        if (file_exists($this->path)) {
            $this->data = json_decode(file_get_contents($this->path), true) ?? $this->empty();
        } else {
            $this->data = $this->empty();
        }
    }

    private function save(): void
    {
        file_put_contents($this->path, json_encode($this->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function empty(): array
    {
        return ['eventTypes' => [], 'bookings' => []];
    }
}

import fs from 'fs'
import path from 'path'

export default async function globalSetup() {
  const data = {
    eventTypes: {
      'test-event-type-uuid': {
        id: 'test-event-type-uuid',
        name: 'Test Meeting',
        description: 'Тестовая встреча для e2e',
        durationMinutes: 30,
      },
    },
    bookings: {},
  }

  const storagePath = path.resolve('storage/app')
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true })
  }

  fs.writeFileSync(
    path.resolve('storage/app/booking-data.json'),
    JSON.stringify(data, null, 2),
  )
}

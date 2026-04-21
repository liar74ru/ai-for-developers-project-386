export interface EventType {
  id: string
  name: string
  description: string
  durationMinutes: number
}

export interface EventTypeInput {
  name: string
  description: string
  durationMinutes: number
}

export interface Slot {
  startTime: string
  endTime: string
  available: boolean
}

export interface Booking {
  id: string
  eventTypeId: string
  guestName?: string
  guestEmail?: string
  startTime: string
  createdAt: string
}

export interface BookingInput {
  eventTypeId: string
  startTime: string
  guestName?: string
  guestEmail?: string
}

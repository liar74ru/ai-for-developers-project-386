import { api } from './client'
import type { EventType, Slot, Booking, BookingInput } from './types'

export const guestApi = {
  getEventTypes: () => api.get<EventType[]>('/guest/event-types'),
  getSlots: (id: string) => api.get<Slot[]>(`/guest/event-types/${id}/slots`),
  createBooking: (data: BookingInput) => api.post<Booking>('/guest/bookings', data),
}

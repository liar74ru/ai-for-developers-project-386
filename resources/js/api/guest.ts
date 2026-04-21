import { api } from './client'
import type { EventType, Slot, Booking, BookingInput } from './types'

export const guestApi = {
  getEventTypes: () => api.get<EventType[]>('/guest/event-types'),
  getSlots: (id: string, timeFormat: '12h' | '24h' = '24h') =>
    api.get<Slot[]>(`/guest/event-types/${id}/slots?timeFormat=${timeFormat}`),
  createBooking: (data: BookingInput) => api.post<Booking>('/guest/bookings', data),
}

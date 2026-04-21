import { api } from './client'
import type { EventType, EventTypeInput, Booking } from './types'

export const adminApi = {
  getEventTypes: () => api.get<EventType[]>('/admin/event-types'),
  createEventType: (data: EventTypeInput) => api.post<EventType>('/admin/event-types', data),
  updateEventType: (id: string, data: EventTypeInput) =>
    api.put<EventType>(`/admin/event-types/${id}`, data),
  deleteEventType: (id: string) => api.delete(`/admin/event-types/${id}`),
  getBookings: () => api.get<Booking[]>('/admin/bookings'),
}

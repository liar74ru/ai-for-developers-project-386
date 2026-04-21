import { useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  format,
  parseISO,
  startOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { guestApi } from '@/api/guest'
import type { EventType, Slot } from '@/api/types'
import { ApiError } from '@/api/client'

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const stateEventType = location.state?.eventType as EventType | undefined

  const { data: eventTypesList } = useQuery({
    queryKey: ['guest-event-types'],
    queryFn: guestApi.getEventTypes,
    enabled: !stateEventType,
  })

  const eventType = stateEventType ?? eventTypesList?.find((e) => e.id === id)

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', id],
    queryFn: () => guestApi.getSlots(id!),
    enabled: !!id,
  })

  const slotsByDate = useMemo(() => {
    if (!slots) return {} as Record<string, Slot[]>
    return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      const key = format(parseISO(slot.startTime), 'yyyy-MM-dd')
      if (!acc[key]) acc[key] = []
      acc[key].push(slot)
      return acc
    }, {})
  }, [slots])

  const availableDateSet = useMemo(() => {
    const set = new Set<string>()
    Object.entries(slotsByDate).forEach(([date, daySlots]) => {
      if (daySlots.some((s) => s.available)) set.add(date)
    })
    return set
  }, [slotsByDate])

  const slotsForDate = selectedDate
    ? (slotsByDate[format(selectedDate, 'yyyy-MM-dd')] ?? [])
    : []

  const bookingMutation = useMutation({
    mutationFn: guestApi.createBooking,
    onSuccess: () => {
      toast.success('Забронировано! Ждём вас.')
      navigate('/')
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Этот слот уже занят. Выберите другое время.')
      } else {
        toast.error('Ошибка при бронировании. Попробуйте снова.')
      }
    },
  })

  const handleSubmit = () => {
    if (!selectedSlot || !eventType) return
    bookingMutation.mutate({
      eventTypeId: eventType.id,
      startTime: selectedSlot.startTime,
      guestName: guestName.trim() || undefined,
      guestEmail: guestEmail.trim() || undefined,
    })
  }

  // Calendar helpers
  const today = startOfDay(new Date())
  const maxDate = addDays(today, 14)
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  })
  // Monday-first offset
  const firstWeekday = getDay(startOfMonth(calendarMonth))
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container py-8">
        {eventType && (
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{eventType.name}</h2>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_260px]">
          {/* Left — event info */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg">
                🧑
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Host</p>
                <p className="text-xs text-muted-foreground">Владелец</p>
              </div>
            </div>

            {eventType && (
              <>
                <p className="font-semibold text-gray-900">{eventType.name}</p>
                <Badge variant="secondary" className="mt-1 flex w-fit items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {eventType.durationMinutes} мин
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">{eventType.description}</p>
              </>
            )}

            <div className="mt-4 space-y-2">
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-muted-foreground">Выбранная дата</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDate ? format(selectedDate, 'EEEE, d MMMM') : '—'}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-muted-foreground">Выбранное время</p>
                <p className="text-sm font-medium text-primary">
                  {selectedSlot ? format(parseISO(selectedSlot.startTime), 'HH:mm') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Center — calendar */}
          <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Календарь</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              {format(calendarMonth, 'MMMM yyyy')}
            </p>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <div key={d} className="py-1 font-medium">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const isAvailable = availableDateSet.has(key)
                const isSelected = selectedDate !== null && isSameDay(day, selectedDate)
                const isInRange = day >= today && day <= maxDate
                const isCurrentMonth = isSameMonth(day, calendarMonth)
                const isToday = isSameDay(day, today)
                const clickable = isAvailable && isInRange && isCurrentMonth

                return (
                  <button
                    key={key}
                    disabled={!clickable}
                    onClick={() => {
                      setSelectedDate(day)
                      setSelectedSlot(null)
                    }}
                    className={cn(
                      'rounded-md py-1.5 text-sm transition-colors',
                      isSelected && 'bg-gray-900 text-white font-semibold',
                      !isSelected && clickable && 'hover:bg-orange-50 text-gray-900 cursor-pointer',
                      !isSelected && isToday && 'ring-1 ring-primary',
                      !isCurrentMonth && 'text-gray-300',
                      !clickable && !isSelected && isCurrentMonth && 'text-gray-300 cursor-default',
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right — slots + form */}
          <div className="rounded-xl border bg-white p-5">
            {!selectedDate && (
              <p className="text-sm text-muted-foreground text-center pt-8">
                Выберите дату в календаре
              </p>
            )}

            {selectedDate && slotsLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
                ))}
              </div>
            )}

            {selectedDate && !slotsLoading && slotsForDate.length === 0 && (
              <p className="text-sm text-muted-foreground text-center pt-8">
                Нет свободных слотов на этот день
              </p>
            )}

            {selectedDate && !slotsLoading && slotsForDate.length > 0 && (
              <>
                <p className="mb-3 text-sm font-semibold text-gray-900">Статус слотов</p>
                <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                  {slotsForDate.map((slot) => {
                    const start = format(parseISO(slot.startTime), 'HH:mm')
                    const end = format(parseISO(slot.endTime), 'HH:mm')
                    const isSelected = selectedSlot?.startTime === slot.startTime

                    return (
                      <button
                        key={slot.startTime}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          isSelected && 'bg-orange-50 border border-orange-200 font-medium',
                          !isSelected && slot.available && 'bg-gray-50 hover:bg-orange-50 cursor-pointer',
                          !slot.available && 'bg-gray-50 text-gray-400 cursor-default',
                        )}
                      >
                        <span>
                          {start}–{end}
                        </span>
                        {isSelected && <span className="text-primary text-xs">✓ Выбрано</span>}
                        {!isSelected && slot.available && (
                          <span className="text-green-600 text-xs">Свободно</span>
                        )}
                        {!slot.available && <span className="text-xs">Занято</span>}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Guest form — appears after slot selection */}
            {selectedSlot && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs text-muted-foreground">Необязательно</p>
                <div className="space-y-1">
                  <Label htmlFor="guestName">Ваше имя</Label>
                  <Input
                    id="guestName"
                    placeholder="Иван Иванов"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="ivan@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Назад
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? 'Загрузка...' : 'Продолжить'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

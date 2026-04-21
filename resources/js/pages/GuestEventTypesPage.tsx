import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { EventTypeCard } from '@/components/EventTypeCard'
import { Button } from '@/components/ui/button'
import { guestApi } from '@/api/guest'

export function GuestEventTypesPage() {
  const { data: eventTypes, isLoading, isError } = useQuery({
    queryKey: ['guest-event-types'],
    queryFn: guestApi.getEventTypes,
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-100 to-amber-100 px-4 py-16">
        <div className="container max-w-2xl">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-600">
            Быстрая запись
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900">Calendar</h1>
          <p className="mt-3 text-lg text-gray-600">
            Выберите тип события и удобное время для встречи.
          </p>
          <Button className="mt-6" asChild>
            <a href="#event-types">
              Записаться <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Event types */}
      <section id="event-types" className="container py-12">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground">
            Не удалось загрузить типы событий. Попробуйте позже.
          </p>
        )}

        {eventTypes && eventTypes.length === 0 && (
          <p className="text-center text-muted-foreground">Нет доступных типов событий.</p>
        )}

        {eventTypes && eventTypes.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {eventTypes.map((et) => (
              <EventTypeCard key={et.id} eventType={et} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-br from-blue-100 to-amber-100 px-4 py-16">
        <div className="container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-600">
              Быстрая запись на звонок
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900">Calendar</h1>
            <p className="mt-3 text-lg text-gray-600">
              Забронируйте встречу за минуту: выберите тип события и удобное время.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/booking">
                Записаться <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Возможности</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Выбор типа события и удобного времени для встречи.</li>
              <li>• Быстрое бронирование с подтверждением и дополнительными заметками.</li>
              <li>• Управление типами встреч и просмотр предстоящих записей в админке.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

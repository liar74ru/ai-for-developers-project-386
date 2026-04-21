import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendar
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/#event-types" className="hover:text-gray-900 transition-colors">
            Записаться
          </a>
          <Link to="/admin" className="hover:text-gray-900 transition-colors">
            Админка
          </Link>
        </nav>
      </div>
    </header>
  )
}

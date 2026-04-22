import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GuestEventTypesPage } from '@/pages/GuestEventTypesPage'
import { BookingPage } from '@/pages/BookingPage'
import { AdminPage } from '@/pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestEventTypesPage />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

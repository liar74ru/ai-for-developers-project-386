import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, CalendarDays, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { adminApi } from '@/api/admin'
import type { EventType, EventTypeInput } from '@/api/types'

const emptyForm: EventTypeInput = { name: '', description: '', durationMinutes: 30 }

export function AdminPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null)
  const [editTarget, setEditTarget] = useState<EventType | null>(null)
  const [form, setForm] = useState<EventTypeInput>(emptyForm)

  const { data: eventTypes, isLoading: etLoading } = useQuery({
    queryKey: ['admin-event-types'],
    queryFn: adminApi.getEventTypes,
  })

  const { data: bookings, isLoading: bookLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: adminApi.getBookings,
  })

  const createMutation = useMutation({
    mutationFn: adminApi.createEventType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-event-types'] })
      toast.success('Тип события создан')
      setDialogOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Ошибка при создании'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventTypeInput }) =>
      adminApi.updateEventType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-event-types'] })
      toast.success('Тип события обновлён')
      setDialogOpen(false)
      setEditTarget(null)
      setForm(emptyForm)
    },
    onError: () => toast.error('Ошибка при обновлении'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteEventType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-event-types'] })
      toast.success('Тип события удалён')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Ошибка при удалении'),
  })

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (et: EventType) => {
    setEditTarget(et)
    setForm({ name: et.name, description: et.description, durationMinutes: et.durationMinutes })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.durationMinutes) return
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="border-b bg-white">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <CalendarDays className="h-5 w-5 text-primary" />
            Calendar · Панель управления
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="event-types">
          <TabsList className="mb-6">
            <TabsTrigger value="event-types">Типы событий</TabsTrigger>
            <TabsTrigger value="bookings">Предстоящие бронирования</TabsTrigger>
          </TabsList>

          {/* Event types tab */}
          <TabsContent value="event-types">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">
                {eventTypes?.length ?? 0} типов событий
              </p>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Добавить
              </Button>
            </div>

            <div className="rounded-xl border bg-white overflow-hidden">
              {etLoading && (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                  ))}
                </div>
              )}

              {!etLoading && (!eventTypes || eventTypes.length === 0) && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Нет типов событий. Создайте первый.
                </p>
              )}

              {eventTypes && eventTypes.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Название</th>
                      <th className="px-4 py-3 font-medium">Описание</th>
                      <th className="px-4 py-3 font-medium text-center">Длительность</th>
                      <th className="px-4 py-3 font-medium text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventTypes.map((et, idx) => (
                      <tr
                        key={et.id}
                        className={idx < eventTypes.length - 1 ? 'border-b' : ''}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900">{et.name}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                          {et.description}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary">{et.durationMinutes} мин</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(et)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Изменить
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(et)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Удалить
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Bookings tab */}
          <TabsContent value="bookings">
            <div className="rounded-xl border bg-white overflow-hidden">
              {bookLoading && (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                  ))}
                </div>
              )}

              {!bookLoading && (!bookings || bookings.length === 0) && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Нет предстоящих бронирований.
                </p>
              )}

              {bookings && bookings.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Дата и время</th>
                      <th className="px-4 py-3 font-medium">Тип события</th>
                      <th className="px-4 py-3 font-medium">Гость</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => {
                      const et = eventTypes?.find((e) => e.id === b.eventTypeId)
                      return (
                        <tr
                          key={b.id}
                          className={idx < bookings.length - 1 ? 'border-b' : ''}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {format(parseISO(b.startTime), 'dd.MM.yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {et?.name ?? b.eventTypeId}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {b.guestName ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {b.guestEmail ?? '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? 'Изменить тип события' : 'Новый тип события'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="et-name">Название *</Label>
              <Input
                id="et-name"
                placeholder="Встреча 30 минут"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="et-desc">Описание</Label>
              <Input
                id="et-desc"
                placeholder="Краткое описание"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="et-dur">Длительность (мин) *</Label>
              <Input
                id="et-dur"
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить тип события?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            «{deleteTarget?.name}» будет удалён навсегда.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

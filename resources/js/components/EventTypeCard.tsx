import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EventType } from '@/api/types'

interface Props {
  eventType: EventType
}

export function EventTypeCard({ eventType }: Props) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/book/${eventType.id}`, { state: { eventType } })}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900">{eventType.name}</h3>
          <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {eventType.durationMinutes} мин
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{eventType.description}</p>
      </CardContent>
    </Card>
  )
}

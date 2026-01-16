import { Plane, Clock, MapPin, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Flight } from '@/types'
import { formatPrice, formatTime, formatDateCompact, formatStops } from '@/utils/formatters'
import { AIRLINE_NAMES } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface FlightCardProps {
  flight: Flight
  onClick?: () => void
  className?: string
}

export function FlightCard({ flight, onClick, className }: FlightCardProps) {
  const stopsVariant = flight.stops === 0 ? 'success' : flight.stops === 1 ? 'warning' : 'secondary'

  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all hover:shadow-md active:scale-[0.99] bg-linear-to-br from-primary/12 via-accent/10 to-warning/10',
        className
      )}
      onClick={onClick}
    >
      {/* Header: Airline & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-accent">
            {flight.airlineCode}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium">
              {AIRLINE_NAMES[flight.airlineCode] || flight.airlineCode}
            </div>
            <div className="text-xs text-muted-foreground">{flight.flightNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="price-text text-lg font-semibold text-accent">
            {formatPrice(flight.price, flight.currency)}
          </div>
          {flight.seatsAvailable <= 5 && (
            <div className="text-xs text-warning">{flight.seatsAvailable} seats left</div>
          )}
        </div>
      </div>

      {/* Flight Route */}
      <div className="mt-4 flex items-center gap-2">
        {/* Departure */}
        <div className="flex-1">
          <div className="text-xl font-semibold">{formatTime(flight.departureTime)}</div>
          <div className="mt-0.5 font-mono text-sm font-medium text-muted-foreground">
            {flight.origin}
          </div>
        </div>

        {/* Duration & Stops */}
        <div className="flex flex-1 flex-col items-center px-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {flight.duration}
          </div>
          <div className="my-1.5 flex w-full items-center">
            <div className="h-px flex-1 bg-border" />
            <Plane className="mx-1 size-4 rotate-90 text-muted-foreground" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <Badge variant={stopsVariant} className="text-[10px] px-1.5 py-0">
            {formatStops(flight.stops)}
          </Badge>
        </div>

        {/* Arrival */}
        <div className="flex-1 text-right">
          <div className="text-xl font-semibold">{formatTime(flight.arrivalTime)}</div>
          <div className="mt-0.5 font-mono text-sm font-medium text-muted-foreground">
            {flight.destination}
          </div>
        </div>
      </div>

      {/* Footer: Date & Class */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{formatDateCompact(flight.departureTime)}</span>
          <span className="capitalize">{flight.cabinClass.replace('_', ' ').toLowerCase()}</span>
        </div>
        {flight.stopLocations.length > 0 && (
          <div className="flex items-center gap-1">
            <MapPin className="size-3" />
            <span className="truncate">{flight.stopLocations.join(', ')}</span>
          </div>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Card>
  )
}

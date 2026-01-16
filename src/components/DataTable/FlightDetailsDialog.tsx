import { Plane, Clock, MapPin, Ticket, Users, Layers } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Flight, FlightSegment } from '@/types'
import { AIRLINE_NAMES } from '@/utils/constants'
import { cn } from '@/utils/cn'
import {
  formatDate,
  formatPrice,
  formatTime,
  formatDuration,
  calculateDuration,
} from '@/utils/formatters'

type FlightDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  flight: Flight | null
}

function SegmentCard({ segment }: { segment: FlightSegment }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{segment.departure.iataCode}</span>
            <Plane className="size-4 text-muted-foreground" />
            <span className="font-mono text-sm font-semibold">{segment.arrival.iataCode}</span>
            <Badge variant="secondary" className="ml-1">
              {segment.carrierCode}
              {segment.number}
            </Badge>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Departure</div>
              <div className="mt-0.5 font-medium">{formatTime(segment.departure.at)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(segment.departure.at, 'EEE, MMM d, yyyy')}
              </div>
              {segment.departure.terminal ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  Terminal {segment.departure.terminal}
                </div>
              ) : null}
            </div>

            <div className="rounded-md bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Arrival</div>
              <div className="mt-0.5 font-medium">{formatTime(segment.arrival.at)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(segment.arrival.at, 'EEE, MMM d, yyyy')}
              </div>
              {segment.arrival.terminal ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  Terminal {segment.arrival.terminal}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1.5 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="font-medium">
              {segment.duration
                ? formatDuration(segment.duration)
                : calculateDuration(segment.departure.at, segment.arrival.at)}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Aircraft {segment.aircraft.code}</div>
          {segment.operating?.carrierCode &&
          segment.operating.carrierCode !== segment.carrierCode ? (
            <div className="mt-1 text-xs text-muted-foreground">
              Operated by {segment.operating.carrierCode}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function FlightDetailsDialog({ open, onOpenChange, flight }: FlightDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        {flight ? (
          <div className="grid max-h-[85vh] grid-rows-[auto_1fr]">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{flight.origin}</span>
                <Plane className="size-4 text-muted-foreground" />
                <span className="font-mono">{flight.destination}</span>
                <Badge variant="secondary" className="ml-1">
                  {flight.cabinClass.replace('_', ' ').toLowerCase()}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {formatPrice(flight.price, flight.currency)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{flight.duration}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {flight.stops === 0
                      ? 'Nonstop'
                      : flight.stops === 1
                        ? `1 stop (${flight.stopLocations.join(', ')})`
                        : `${flight.stops} stops (${flight.stopLocations.join(', ')})`}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-muted-foreground" />
                  <span
                    className={cn(
                      'text-muted-foreground',
                      flight.seatsAvailable <= 5 && 'text-warning'
                    )}
                  >
                    {flight.seatsAvailable} seat{flight.seatsAvailable === 1 ? '' : 's'} left
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="px-6 pb-6">
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="text-sm font-medium">Airline</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded bg-muted text-xs font-bold text-accent">
                      {flight.airlineCode}
                    </div>
                    <div>
                      <div className="font-medium">
                        {AIRLINE_NAMES[flight.airlineCode] ||
                          flight.airlineName ||
                          flight.airlineCode}
                      </div>
                      <div className="text-xs text-muted-foreground">{flight.flightNumber}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Itinerary</div>
                    <div className="text-xs text-muted-foreground">Offer ID: {flight.id}</div>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    {flight.outboundSegments.map((segment, idx) => (
                      <SegmentCard
                        key={`${segment.carrierCode}-${segment.number}-${idx}`}
                        segment={segment}
                      />
                    ))}
                  </div>

                  {flight.returnSegments && flight.returnSegments.length > 0 ? (
                    <>
                      <div className="mt-6 text-sm font-medium">Return</div>
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        {flight.returnSegments.map((segment, idx) => (
                          <SegmentCard
                            key={`return-${segment.carrierCode}-${segment.number}-${idx}`}
                            segment={segment}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div>
                  <div className="text-sm font-medium">Fare & Ticketing</div>
                  <Separator className="my-3" />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Last ticketing date</div>
                      <div className="mt-1 font-medium">{flight.raw.lastTicketingDate || '—'}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Booking class</div>
                      <div className="mt-1 font-medium">{flight.bookingClass || '—'}</div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border p-4">
                    <div className="text-xs text-muted-foreground">Traveler pricing</div>
                    <div className="mt-2 space-y-3">
                      {flight.raw.travelerPricings?.map((tp) => (
                        <div key={tp.travelerId} className="rounded-md bg-muted/30 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              {tp.travelerType} (#{tp.travelerId})
                            </div>
                            <div className="text-sm font-semibold text-accent">
                              {tp.price?.total
                                ? formatPrice(parseFloat(tp.price.total), tp.price.currency)
                                : '—'}
                            </div>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {tp.fareDetailsBySegment?.map((fd) => (
                              <div
                                key={fd.segmentId}
                                className="rounded-md border bg-background p-3"
                              >
                                <div className="text-xs text-muted-foreground">
                                  Segment {fd.segmentId}
                                </div>
                                <div className="mt-1 text-sm">
                                  <span className="font-medium">Cabin:</span> {fd.cabin}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Class:</span> {fd.class}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Fare basis:</span> {fd.fareBasis}
                                </div>
                                {fd.includedCheckedBags?.quantity != null ? (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Checked bags: {fd.includedCheckedBags.quantity}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* <div>
                  <div className="text-sm font-medium">Raw Offer (JSON)</div>
                  <Separator className="my-3" />
                  <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/20 p-4 text-xs leading-relaxed">
                    {JSON.stringify(flight.raw, null, 2)}
                  </pre>
                </div> */}
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

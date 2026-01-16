import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Plane, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Flight } from '@/types'
import { formatPrice, formatTime, formatDateCompact, formatStops } from '@/utils/formatters'
import { AIRLINE_NAMES } from '@/utils/constants'

const columnHelper = createColumnHelper<Flight>()

export function useFlightColumns() {
  return useMemo(
    () => [
      // Airline Column
      columnHelper.accessor('airlineCode', {
        id: 'airline',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Airline
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 size-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 size-3" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const airline = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded bg-muted text-xs font-bold text-accent">
                {airline.airlineCode}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {AIRLINE_NAMES[airline.airlineCode] || airline.airlineCode}
                </div>
                <div className="text-xs text-muted-foreground">{airline.flightNumber}</div>
              </div>
            </div>
          )
        },
        size: 180,
      }),

      // Route Column
      columnHelper.accessor(
        (row) => `${row.origin}-${row.destination}`,
        {
          id: 'route',
          header: 'Route',
          cell: ({ row }) => {
            const flight = row.original
            return (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{flight.origin}</span>
                <Plane className="size-4 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">{flight.destination}</span>
              </div>
            )
          },
          size: 140,
        }
      ),

      // Departure Column
      columnHelper.accessor('departureTime', {
        id: 'departure',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Departure
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 size-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 size-3" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const flight = row.original
          return (
            <div>
              <div className="font-medium">{formatTime(flight.departureTime)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDateCompact(flight.departureTime)}
              </div>
            </div>
          )
        },
        size: 110,
      }),

      // Arrival Column
      columnHelper.accessor('arrivalTime', {
        id: 'arrival',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Arrival
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 size-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 size-3" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const flight = row.original
          return (
            <div>
              <div className="font-medium">{formatTime(flight.arrivalTime)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDateCompact(flight.arrivalTime)}
              </div>
            </div>
          )
        },
        size: 110,
      }),

      // Duration Column
      columnHelper.accessor('duration', {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const flight = row.original
          return (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{flight.duration}</span>
            </div>
          )
        },
        size: 100,
      }),

      // Stops Column
      columnHelper.accessor('stops', {
        id: 'stops',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Stops
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 size-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 size-3" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const flight = row.original
          const variant = flight.stops === 0 ? 'success' : flight.stops === 1 ? 'warning' : 'secondary'

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Badge variant={variant} className="whitespace-nowrap">
                    {formatStops(flight.stops)}
                  </Badge>
                </div>
              </TooltipTrigger>
              {flight.stopLocations.length > 0 && (
                <TooltipContent>
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {flight.stopLocations.join(', ')}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )
        },
        size: 100,
      }),

      // Cabin Class Column
      columnHelper.accessor('cabinClass', {
        id: 'class',
        header: 'Class',
        cell: ({ row }) => {
          const cabinClass = row.original.cabinClass
          const label = cabinClass.replace('_', ' ').toLowerCase()
          return (
            <span className="text-sm capitalize text-muted-foreground">{label}</span>
          )
        },
        size: 120,
      }),

      // Price Column
      columnHelper.accessor('price', {
        id: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 size-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 size-3" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const flight = row.original
          return (
            <div className="text-right">
              <div className="price-text text-base font-semibold text-accent">
                {formatPrice(flight.price, flight.currency)}
              </div>
              {flight.seatsAvailable <= 5 && (
                <div className="text-xs text-warning">
                  {flight.seatsAvailable} left
                </div>
              )}
            </div>
          )
        },
        size: 100,
      }),
    ],
    []
  )
}

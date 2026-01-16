import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Flight } from '@/types'
import { formatPrice } from '@/utils/formatters'
import { AIRLINE_NAMES } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface AirlinePriceChartProps {
  flights: Flight[]
  className?: string
}

interface AirlineData {
  airline: string
  airlineName: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  count: number
}

const COLORS = [
  'hsl(239, 84%, 67%)', // indigo
  'hsl(258, 90%, 66%)', // violet
  'hsl(280, 87%, 65%)', // purple
  'hsl(142, 71%, 45%)', // green
  'hsl(38, 92%, 50%)', // amber
  'hsl(199, 89%, 48%)', // sky
  'hsl(346, 77%, 49%)', // rose
  'hsl(25, 95%, 53%)', // orange
]

type TooltipRendererProps = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}

function CustomTooltip({ active, payload }: TooltipRendererProps) {
  const raw = payload?.[0]?.payload
  if (!active || !raw) return null

  const data = raw as AirlineData
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{data.airlineName}</div>
      <div className="mt-1 space-y-0.5 text-muted-foreground">
        <div>Avg: {formatPrice(data.avgPrice)}</div>
        <div>
          Range: {formatPrice(data.minPrice)} – {formatPrice(data.maxPrice)}
        </div>
        <div>{data.count} flights</div>
      </div>
    </div>
  )
}

export function AirlinePriceChart({ flights, className }: AirlinePriceChartProps) {
  // Process flight data by airline
  const chartData = useMemo<AirlineData[]>(() => {
    if (flights.length === 0) return []

    const airlineMap = new Map<string, Flight[]>()

    flights.forEach((flight) => {
      const existing = airlineMap.get(flight.airlineCode) || []
      existing.push(flight)
      airlineMap.set(flight.airlineCode, existing)
    })

    const data: AirlineData[] = []
    airlineMap.forEach((flightList, airline) => {
      const prices = flightList.map((f) => f.price)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

      data.push({
        airline,
        airlineName: AIRLINE_NAMES[airline] || airline,
        avgPrice: Math.round(avgPrice),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: flightList.length,
      })
    })

    // Sort by average price and take top 8
    return data.sort((a, b) => a.avgPrice - b.avgPrice).slice(0, 8)
  }, [flights])

  if (flights.length === 0) {
    return (
      <Card
        className={cn(
          'bg-linear-to-br from-primary/12 via-accent/10 to-warning/10 animate-fade-up',
          className
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Price by Airline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Search for flights to see airline comparison
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'bg-linear-to-br from-primary/12 via-accent/10 to-warning/10 animate-fade-up',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Average Price by Airline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                tickFormatter={(value) => formatPrice(value)}
              />
              <YAxis
                type="category"
                dataKey="airline"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                width={40}
              />
              <Tooltip content={CustomTooltip} />
              <Bar dataKey="avgPrice" radius={[0, 4, 4, 0]} animationDuration={500}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

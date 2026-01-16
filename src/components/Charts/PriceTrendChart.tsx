import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Flight } from '@/types'
import { formatPrice, getHourFromDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface PriceTrendChartProps {
  flights: Flight[]
  className?: string
  bucketHours?: number
}

type TrendPoint = {
  label: string
  avgPrice: number
  count: number
}

type TooltipRendererProps = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}

function PriceTrendTooltip({ active, payload }: TooltipRendererProps) {
  const raw = payload?.[0]?.payload
  if (!active || !raw) return null
  const data = raw as TrendPoint

  return (
    <div className="rounded-lg border bg-linear-to-br from-primary/12 via-accent/10 to-warning/10 px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{data.label}</div>
      <div className="mt-0.5 text-muted-foreground">Avg: {formatPrice(data.avgPrice)}</div>
      <div className="text-muted-foreground">{data.count} flights</div>
    </div>
  )
}

export function PriceTrendChart({ flights, className, bucketHours = 3 }: PriceTrendChartProps) {
  const chartData = useMemo<TrendPoint[]>(() => {
    if (flights.length === 0) return []

    const size = Math.max(1, Math.min(6, Math.floor(bucketHours)))
    const bucketCount = Math.ceil(24 / size)

    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const start = i * size
      const end = Math.min(24, (i + 1) * size)
      const label = `${start.toString().padStart(2, '0')}:00–${end.toString().padStart(2, '0')}:00`
      return {
        start,
        end,
        label,
        sum: 0,
        count: 0,
      }
    })

    for (const flight of flights) {
      const hour = getHourFromDate(flight.departureTime)
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor(hour / size)))
      buckets[idx].sum += flight.price
      buckets[idx].count += 1
    }

    return buckets
      .filter((b) => b.count > 0)
      .map((b) => ({
        label: b.label,
        avgPrice: Math.round(b.sum / b.count),
        count: b.count,
      }))
  }, [flights, bucketHours])

  if (flights.length === 0) {
    return (
      <Card
        className={cn(
          'bg-linear-to-br from-primary/12 via-accent/10 to-warning/10 animate-fade-up',
          className
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Search for flights to see price trends
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
        <CardTitle className="text-base font-medium">Average Price by Departure Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                tickFormatter={(value) => formatPrice(value)}
                width={72}
              />
              <Tooltip content={PriceTrendTooltip} />
              <Line
                type="monotone"
                dataKey="avgPrice"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

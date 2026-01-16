import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Flight } from '@/types'
import { formatPrice } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface PriceChartProps {
  flights: Flight[]
  className?: string
}

interface ChartDataPoint {
  range: string
  count: number
  minPrice: number
  maxPrice: number
}

export function PriceChart({ flights, className }: PriceChartProps) {
  // Process flight data into price distribution
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (flights.length === 0) return []

    const prices = flights.map((f) => f.price).sort((a, b) => a - b)
    const minPrice = prices[0]
    const maxPrice = prices[prices.length - 1]
    const range = maxPrice - minPrice

    // Create 8 buckets for price distribution
    const bucketCount = 8
    const bucketSize = range / bucketCount || 1

    const buckets: ChartDataPoint[] = []

    for (let i = 0; i < bucketCount; i++) {
      const bucketMin = minPrice + i * bucketSize
      const bucketMax = minPrice + (i + 1) * bucketSize
      const flightsInBucket = flights.filter(
        (f) =>
          f.price >= bucketMin &&
          (i === bucketCount - 1 ? f.price <= bucketMax : f.price < bucketMax)
      )

      if (flightsInBucket.length > 0 || i === 0 || i === bucketCount - 1) {
        buckets.push({
          range: `${formatPrice(bucketMin)}`,
          count: flightsInBucket.length,
          minPrice: bucketMin,
          maxPrice: bucketMax,
        })
      }
    }

    return buckets
  }, [flights])

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ payload: ChartDataPoint }>
  }) => {
    if (!active || !payload?.[0]) return null

    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-linear-to-br from-primary/12 via-accent/10 to-warning/10 px-3 py-2 text-sm shadow-lg">
        <div className="font-medium">{data.count} flights</div>
        <div className="text-muted-foreground">
          {formatPrice(data.minPrice)} – {formatPrice(data.maxPrice)}
        </div>
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <Card
        className={cn('bg-linear-to-br from-primary/12 via-accent/10 to-warning/10', className)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Price Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Search for flights to see price analytics
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-linear-to-br from-primary/12 via-accent/10 to-warning/10', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Price Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
                fill="url(#priceGradient)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

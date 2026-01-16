import { useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface PriceRangeFilterProps {
  value: [number, number]
  min: number
  max: number
  onChange: (value: [number, number]) => void
  className?: string
}

export function PriceRangeFilter({
  value,
  min,
  max,
  onChange,
  className,
}: PriceRangeFilterProps) {
  const handleChange = useCallback(
    (newValue: number[]) => {
      onChange([newValue[0], newValue[1]])
    },
    [onChange]
  )

  // Calculate step based on range
  const range = max - min
  const step = range > 1000 ? 50 : range > 500 ? 25 : 10

  return (
    <div className={cn('', className)}>
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-sm font-medium">Price Range</Label>
        <span className="text-sm text-muted-foreground">
          {formatPrice(value[0])} – {formatPrice(value[1])}
        </span>
      </div>
      
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        className="mt-2"
      />

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  )
}

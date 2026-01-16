import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AirlineFilter } from './AirlineFilter'
import { StopsFilter } from './StopsFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import type { FilterState } from '@/types'
import { cn } from '@/utils/cn'

interface FilterPanelProps {
  filters: FilterState
  availableAirlines: string[]
  priceRange: [number, number]
  activeFilterCount: number
  onFilterChange: (filters: Partial<FilterState>) => void
  onReset: () => void
  className?: string
}

export function FilterPanel({
  filters,
  availableAirlines,
  priceRange,
  activeFilterCount,
  onFilterChange,
  onReset,
  className,
}: FilterPanelProps) {
  return (
    <Card
      className={cn('p-4 bg-linear-to-br from-primary/12 via-accent/10 to-warning/10', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="accent" className="size-5 justify-center p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Stops Filter */}
        <StopsFilter value={filters.stops} onChange={(stops) => onFilterChange({ stops })} />

        <Separator />

        {/* Price Range Filter */}
        <PriceRangeFilter
          value={filters.priceRange}
          min={priceRange[0]}
          max={priceRange[1]}
          onChange={(priceRange) => onFilterChange({ priceRange })}
        />

        <Separator />

        {/* Airline Filter */}
        <AirlineFilter
          airlines={filters.airlines}
          availableAirlines={availableAirlines}
          onChange={(airlines) => onFilterChange({ airlines })}
        />
      </div>
    </Card>
  )
}

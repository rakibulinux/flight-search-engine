import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AirlineFilter } from './AirlineFilter'
import { StopsFilter } from './StopsFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import type { FilterState } from '@/types'
import { cn } from '@/utils/cn'

interface MobileFilterDrawerProps {
  filters: FilterState
  availableAirlines: string[]
  priceRange: [number, number]
  activeFilterCount: number
  onFilterChange: (filters: Partial<FilterState>) => void
  onReset: () => void
  className?: string
}

export function MobileFilterDrawer({
  filters,
  availableAirlines,
  priceRange,
  activeFilterCount,
  onFilterChange,
  onReset,
  className,
}: MobileFilterDrawerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Filter className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="accent" className="size-5 justify-center p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md py-10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Filters</DialogTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Reset all
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="accent">Apply Filters</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

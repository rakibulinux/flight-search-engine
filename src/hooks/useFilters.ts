import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FilterState, Flight, SortState } from '@/types'
import { DEFAULT_FILTERS, DEFAULT_SORT, DEBOUNCE_DELAY } from '@/utils/constants'
import { useDebounce } from './useDebounce'
import { getHourFromDate } from '@/utils/formatters'

interface UseFiltersReturn {
  filters: FilterState
  debouncedFilters: FilterState
  sort: SortState
  setFilters: (filters: Partial<FilterState>) => void
  setSort: (sort: SortState) => void
  resetFilters: () => void
  getFilteredData: (data: Flight[]) => Flight[]
  getSortedData: (data: Flight[]) => Flight[]
  availableAirlines: string[]
  priceRange: [number, number]
  activeFilterCount: number
}

export function useFilters(flights: Flight[]): UseFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Initialize filters from URL params or defaults
  const [filters, setFiltersState] = useState<FilterState>(() => {
    const airlines = searchParams.get('airlines')?.split(',').filter(Boolean) || []
    const stops = searchParams.get('stops')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    
    return {
      ...DEFAULT_FILTERS,
      airlines,
      stops: stops !== null ? parseInt(stops, 10) : null,
      priceRange: [
        priceMin ? parseInt(priceMin, 10) : 0,
        priceMax ? parseInt(priceMax, 10) : 10000,
      ],
    }
  })

  const [sort, setSort] = useState<SortState>(() => {
    const field = searchParams.get('sortBy') as SortState['field'] | null
    const direction = searchParams.get('sortDir') as SortState['direction'] | null
    
    return {
      field: field || DEFAULT_SORT.field,
      direction: direction || DEFAULT_SORT.direction,
    }
  })

  // Debounced filters for performance
  const debouncedFilters = useDebounce(filters, DEBOUNCE_DELAY.FILTER)

  // Calculate available airlines from flights
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    flights.forEach((flight) => {
      airlines.add(flight.airlineCode)
    })
    return Array.from(airlines).sort()
  }, [flights])

  // Calculate price range from flights
  const priceRange = useMemo<[number, number]>(() => {
    if (flights.length === 0) return [0, 10000]
    const prices = flights.map((f) => f.price)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [flights])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.airlines.length > 0) {
      params.set('airlines', filters.airlines.join(','))
    }
    if (filters.stops !== null) {
      params.set('stops', filters.stops.toString())
    }
    if (filters.priceRange[0] > 0) {
      params.set('priceMin', filters.priceRange[0].toString())
    }
    if (filters.priceRange[1] < 10000) {
      params.set('priceMax', filters.priceRange[1].toString())
    }
    if (sort.field !== DEFAULT_SORT.field) {
      params.set('sortBy', sort.field)
    }
    if (sort.direction !== DEFAULT_SORT.direction) {
      params.set('sortDir', sort.direction)
    }
    
    setSearchParams(params, { replace: true })
  }, [filters, sort, setSearchParams])

  // Set filters with partial update
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFiltersState({
      ...DEFAULT_FILTERS,
      priceRange: priceRange,
    })
  }, [priceRange])

  // Filter flights
  const getFilteredData = useCallback(
    (data: Flight[]): Flight[] => {
      return data.filter((flight) => {
        // Airline filter
        if (
          debouncedFilters.airlines.length > 0 &&
          !debouncedFilters.airlines.includes(flight.airlineCode)
        ) {
          return false
        }

        // Stops filter
        if (debouncedFilters.stops !== null) {
          if (debouncedFilters.stops === 2) {
            // 2+ stops: show all
          } else if (flight.stops > debouncedFilters.stops) {
            return false
          }
        }

        // Price range filter
        if (
          flight.price < debouncedFilters.priceRange[0] ||
          flight.price > debouncedFilters.priceRange[1]
        ) {
          return false
        }

        // Departure time filter
        const departureHour = getHourFromDate(flight.departureTime)
        if (
          departureHour < debouncedFilters.departureTimeRange[0] ||
          departureHour > debouncedFilters.departureTimeRange[1]
        ) {
          return false
        }

        // Cabin class filter
        if (
          debouncedFilters.cabinClasses.length > 0 &&
          !debouncedFilters.cabinClasses.includes(flight.cabinClass as never)
        ) {
          return false
        }

        return true
      })
    },
    [debouncedFilters]
  )

  // Sort flights
  const getSortedData = useCallback(
    (data: Flight[]): Flight[] => {
      return [...data].sort((a, b) => {
        let comparison = 0

        switch (sort.field) {
          case 'price':
            comparison = a.price - b.price
            break
          case 'duration':
            comparison =
              new Date(a.arrivalTime).getTime() -
              new Date(a.departureTime).getTime() -
              (new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime())
            break
          case 'departure':
            comparison = new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
            break
          case 'arrival':
            comparison = new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
            break
          case 'stops':
            comparison = a.stops - b.stops
            break
          default:
            comparison = 0
        }

        return sort.direction === 'asc' ? comparison : -comparison
      })
    },
    [sort]
  )

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.airlines.length > 0) count++
    if (filters.stops !== null) count++
    if (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) count++
    if (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24) count++
    if (filters.cabinClasses.length > 0) count++
    return count
  }, [filters, priceRange])

  return {
    filters,
    debouncedFilters,
    sort,
    setFilters,
    setSort,
    resetFilters,
    getFilteredData,
    getSortedData,
    availableAirlines,
    priceRange,
    activeFilterCount,
  }
}

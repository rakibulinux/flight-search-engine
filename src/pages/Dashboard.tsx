import { useMemo, useCallback } from 'react'
import { Header, Footer } from '@/components/Layout'
import { SearchForm, RecentSearches } from '@/components/Search'
import { FilterPanel, MobileFilterDrawer } from '@/components/Filters'
import { DataTable } from '@/components/DataTable'
import { PriceChart, AirlinePriceChart } from '@/components/Charts'
import { useSearch } from '@/contexts/SearchContext'
import { getHourFromDate } from '@/utils/formatters'
import { DEFAULT_FILTERS } from '@/utils/constants'

export function Dashboard() {
  const { state, dispatch } = useSearch()
  const { flights, isSearching, searchError, filters } = state

  // Calculate available airlines from flights
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    flights.forEach((flight) => airlines.add(flight.airlineCode))
    return Array.from(airlines).sort()
  }, [flights])

  // Calculate price range from flights
  const priceRange = useMemo<[number, number]>(() => {
    if (flights.length === 0) return [0, 10000]
    const prices = flights.map((f) => f.price)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [flights])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.airlines.length > 0) count++
    if (filters.stops !== null) count++
    if (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) count++
    return count
  }, [filters, priceRange])

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      // Airline filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airlineCode)) {
        return false
      }

      // Stops filter
      if (filters.stops !== null) {
        if (filters.stops === 2) {
          // 2+ stops: show all
        } else if (flight.stops > filters.stops) {
          return false
        }
      }

      // Price range filter
      if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
        return false
      }

      // Departure time filter
      const departureHour = getHourFromDate(flight.departureTime)
      if (
        departureHour < filters.departureTimeRange[0] ||
        departureHour > filters.departureTimeRange[1]
      ) {
        return false
      }

      return true
    })
  }, [flights, filters])

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch({ type: 'SET_FILTERS', payload: newFilters })
    },
    [dispatch]
  )

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...DEFAULT_FILTERS,
        priceRange: priceRange,
      },
    })
  }, [dispatch, priceRange])

  const hasResults = flights.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-6">
        {/* Search Section */}
        <section className="mb-8">
          <SearchForm />
          <div className="mt-4">
            <RecentSearches />
          </div>
        </section>

        {/* Results Section */}
        {(hasResults || isSearching || searchError) && (
          <section>
            {/* Mobile Filter Button */}
            <div className="mb-4 lg:hidden">
              <MobileFilterDrawer
                filters={filters}
                availableAirlines={availableAirlines}
                priceRange={priceRange}
                activeFilterCount={activeFilterCount}
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Sidebar Filters (Desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-6">
                  <FilterPanel
                    filters={filters}
                    availableAirlines={availableAirlines}
                    priceRange={priceRange}
                    activeFilterCount={activeFilterCount}
                    onFilterChange={handleFilterChange}
                    onReset={handleFilterReset}
                  />

                  {/* Charts */}
                  <PriceChart flights={filteredFlights} />
                  <AirlinePriceChart flights={filteredFlights} />
                </div>
              </aside>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Mobile Charts */}
                <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                  <PriceChart flights={filteredFlights} />
                  <AirlinePriceChart flights={filteredFlights} />
                </div>

                {/* Flight Table */}
                <DataTable
                  data={filteredFlights}
                  isLoading={isSearching}
                  isError={!!searchError}
                  errorMessage={searchError || undefined}
                />
              </div>
            </div>
          </section>
        )}

        {/* Empty State - Initial Load */}
        {!hasResults && !isSearching && !searchError && (
          <section className="flex flex-col items-center justify-center py-16">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-semibold">Search for Flights</h2>
              <p className="mt-2 text-muted-foreground">
                Enter your origin, destination, and travel dates to find the best flight deals.
                Use filters to narrow down results by price, stops, and airlines.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

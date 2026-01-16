import { useMemo, useCallback, useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { Header, Footer } from '@/components/Layout'
import { SearchForm, RecentSearches } from '@/components/Search'
import { FilterPanel, MobileFilterDrawer } from '@/components/Filters'
import { DataTable } from '@/components/DataTable'
import { PriceChart, AirlinePriceChart, PriceTrendChart } from '@/components/Charts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/contexts/SearchContext'
import { getHourFromDate } from '@/utils/formatters'
import { DEFAULT_FILTERS } from '@/utils/constants'

export function Dashboard() {
  const { state, dispatch } = useSearch()
  const { flights, isSearching, searchError, filters } = state
  const [showMobileCharts, setShowMobileCharts] = useState(false)

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
          // 2+ stops
          if (flight.stops < 2) return false
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

      <main className="flex-1">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          <section className="mb-6 sm:mb-8 animate-fade-up">
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-accent/10 to-warning/10" />
                <div className="relative p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="text-xs font-medium text-muted-foreground">
                        Search smarter. Compare faster.
                      </div>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                        Find the best flights with price analytics
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Explore routes, compare airlines, and use filters to narrow down the perfect
                        itinerary.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border bg-card/70 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-card/60">
                        <div className="text-xs text-muted-foreground">Results</div>
                        <div className="text-lg font-semibold leading-tight">{flights.length}</div>
                      </div>
                      <div className="rounded-lg border bg-card/70 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-card/60">
                        <div className="text-xs text-muted-foreground">Airlines</div>
                        <div className="text-lg font-semibold leading-tight">
                          {availableAirlines.length}
                        </div>
                      </div>
                      <div className="hidden sm:block rounded-lg border bg-card/70 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-card/60">
                        <div className="text-xs text-muted-foreground">Active filters</div>
                        <div className="text-lg font-semibold leading-tight">
                          {activeFilterCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Search Section */}
          <section className="mb-6 sm:mb-8 animate-fade-up">
            <SearchForm />
            <div className="mt-3 sm:mt-4">
              <RecentSearches />
            </div>
          </section>

          {/* Results Section */}
          {(hasResults || isSearching || searchError) && (
            <section>
              {/* Mobile Controls */}
              <div className="flex flex-wrap items-center gap-2 mb-4 lg:hidden">
                <MobileFilterDrawer
                  filters={filters}
                  availableAirlines={availableAirlines}
                  priceRange={priceRange}
                  activeFilterCount={activeFilterCount}
                  onFilterChange={handleFilterChange}
                  onReset={handleFilterReset}
                />
                {hasResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileCharts(!showMobileCharts)}
                    className="gap-2"
                  >
                    <BarChart3 className="size-4" />
                    Analytics
                    {showMobileCharts ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Mobile Charts - Collapsible */}
              {showMobileCharts && hasResults && (
                <div className="mb-4 lg:hidden">
                  <Card className="p-3 sm:p-4 animate-fade-up">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <PriceChart flights={filteredFlights} />
                      <AirlinePriceChart flights={filteredFlights} />
                      <PriceTrendChart flights={filteredFlights} />
                    </div>
                  </Card>
                </div>
              )}

              <div className="grid gap-4 lg:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
                {/* Sidebar Filters (Desktop) */}
                <aside className="hidden lg:block">
                  <div className="sticky top-4 space-y-4">
                    <FilterPanel
                      filters={filters}
                      availableAirlines={availableAirlines}
                      priceRange={priceRange}
                      activeFilterCount={activeFilterCount}
                      onFilterChange={handleFilterChange}
                      onReset={handleFilterReset}
                    />
                    {/* Charts */}
                    {hasResults && (
                      <>
                        <PriceChart flights={filteredFlights} />
                        <AirlinePriceChart flights={filteredFlights} />
                        <PriceTrendChart flights={filteredFlights} />
                      </>
                    )}
                  </div>
                </aside>

                {/* Main Content - Flight Table/Cards */}
                <div className="min-w-0">
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
            <section className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 animate-fade-up">
              <div className="max-w-md text-center">
                <h2 className="text-xl sm:text-2xl font-semibold">Search for Flights</h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Enter your origin, destination, and travel dates to find the best flight deals.
                  Use filters to narrow down results.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

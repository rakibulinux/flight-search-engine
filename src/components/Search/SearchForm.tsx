import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Search, ArrowRightLeft, Users, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { AirportInput } from './AirportInput'
import { useSearch } from '@/contexts/SearchContext'
import { searchFlights } from '@/services/amadeus'
import { validateSearchParams } from '@/utils/validators'
import { CABIN_CLASS_OPTIONS } from '@/utils/constants'
import type { SearchParams, CabinClass, Airport } from '@/types'
import { cn } from '@/utils/cn'
import { DatePicker } from './DatePicker'

interface SearchFormProps {
  className?: string
  onSearch?: () => void
}

export function SearchForm({ className, onSearch }: SearchFormProps) {
  const { dispatch, addRecentSearch } = useSearch()

  const [formData, setFormData] = useState<Partial<SearchParams>>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    cabinClass: 'ECONOMY',
  })

  const [originAirport, setOriginAirport] = useState<Airport | undefined>()
  const [destinationAirport, setDestinationAirport] = useState<Airport | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get today's date for min date
  const today = format(new Date(), 'yyyy-MM-dd')

  const originDisplayValue = originAirport
    ? `${originAirport.iataCode} - ${originAirport.cityName}`
    : ''
  const destinationDisplayValue = destinationAirport
    ? `${destinationAirport.iataCode} - ${destinationAirport.cityName}`
    : ''

  // Handle form field changes
  const handleChange = useCallback(
    (field: keyof SearchParams, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when field is changed
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [errors]
  )

  // Handle origin selection
  const handleOriginChange = (code: string, airport?: Airport) => {
    setOriginAirport(airport)
    handleChange('origin', code)
  }

  // Handle destination selection
  const handleDestinationChange = (code: string, airport?: Airport) => {
    setDestinationAirport(airport)
    handleChange('destination', code)
  }

  // Swap origin and destination
  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }))
    const tempAirport = originAirport
    setOriginAirport(destinationAirport)
    setDestinationAirport(tempAirport)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const validation = validateSearchParams(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    dispatch({ type: 'SET_SEARCHING', payload: true })
    dispatch({ type: 'CLEAR_RESULTS' })

    try {
      const searchParams = formData as SearchParams
      dispatch({ type: 'SET_SEARCH_PARAMS', payload: searchParams })

      const result = await searchFlights(searchParams)

      dispatch({
        type: 'SET_FLIGHTS',
        payload: { flights: result.flights, total: result.total },
      })

      // Add to recent searches
      addRecentSearch({
        id: Date.now().toString(),
        params: searchParams,
        timestamp: Date.now(),
        resultCount: result.total,
      })

      onSearch?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search flights'
      dispatch({ type: 'SET_SEARCH_ERROR', payload: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      className={cn(
        'p-4 sm:p-6 bg-linear-to-br from-primary/12 via-accent/10 to-warning/10',
        className
      )}
    >
      <form onSubmit={handleSubmit}>
        {/* Route Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr]">
          <AirportInput
            id="origin"
            label="From"
            value={originDisplayValue}
            placeholder="City or airport"
            error={errors.origin}
            onChange={handleOriginChange}
          />

          {/* Swap Button */}
          <div className="hidden items-end justify-center pb-1 lg:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSwap}
              className="rounded-full"
            >
              <ArrowRightLeft className="size-4" />
              <span className="sr-only">Swap origin and destination</span>
            </Button>
          </div>

          <AirportInput
            id="destination"
            label="To"
            value={destinationDisplayValue}
            placeholder="City or airport"
            error={errors.destination}
            onChange={handleDestinationChange}
          />
        </div>

        {/* Dates and Options */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DatePicker
            id="departureDate"
            label="Departure"
            value={formData.departureDate || ''}
            min={today}
            error={errors.departureDate}
            onChange={(next) => {
              handleChange('departureDate', next)
              if (formData.returnDate && next && formData.returnDate < next) {
                handleChange('returnDate', '')
              }
            }}
          />

          <DatePicker
            id="returnDate"
            label="Return"
            optional
            value={formData.returnDate || ''}
            min={formData.departureDate || today}
            error={errors.returnDate}
            onChange={(next) => handleChange('returnDate', next)}
          />

          {/* Passengers */}
          <div>
            <Label htmlFor="adults" className="mb-1.5 block text-sm font-medium">
              Passengers
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="adults"
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal cursor-pointer"
                >
                  <Users className="size-4 text-muted-foreground" />
                  {formData.adults} Adult{formData.adults !== 1 ? 's' : ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adults</span>
                  <div className="flex items-center gap-2">
                    <Button
                      className="cursor-pointer"
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        handleChange('adults', Math.max(1, (formData.adults || 1) - 1))
                      }
                      disabled={(formData.adults || 1) <= 1}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center font-medium">{formData.adults}</span>
                    <Button
                      className="cursor-pointer"
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        handleChange('adults', Math.min(9, (formData.adults || 1) + 1))
                      }
                      disabled={(formData.adults || 1) >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cabin Class */}
          <div>
            <Label htmlFor="cabinClass" className="mb-1.5 block text-sm font-medium">
              Class
            </Label>
            <Select
              value={formData.cabinClass}
              onValueChange={(value) => handleChange('cabinClass', value as CabinClass)}
            >
              <SelectTrigger id="cabinClass" className="cursor-pointer">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {CABIN_CLASS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full gap-2 sm:w-auto cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Plane className="size-4 animate-pulse" />
                Searching...
              </>
            ) : (
              <>
                <Search className="size-4" />
                Search Flights
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { searchLocations } from '@/services/amadeus'
import type { Airport } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'

interface AirportInputProps {
  id: string
  label: string
  value: string
  placeholder?: string
  error?: string
  onChange: (code: string, airport?: Airport) => void
  className?: string
}

export function AirportInput({
  id,
  label,
  value,
  placeholder = 'City or airport',
  error,
  onChange,
  className,
}: AirportInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebounce(inputValue, 300)

  // Select an airport
  const selectAirport = useCallback(
    (airport: Airport) => {
      setInputValue(`${airport.iataCode} - ${airport.cityName}`)
      onChange(airport.iataCode, airport)
      setIsOpen(false)
      setSuggestions([])
      setSelectedIndex(-1)
    },
    [onChange]
  )

  // Fetch suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedValue.length < 2) {
        setSuggestions([])
        return
      }

      // Don't search if it looks like a selected IATA code
      if (/^[A-Z]{3}$/.test(debouncedValue)) {
        return
      }

      setIsLoading(true)
      try {
        const results = await searchLocations(debouncedValue)
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Failed to fetch airport suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedValue])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            selectAirport(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    },
    [isOpen, suggestions, selectedIndex, selectAirport]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Clear selection if input is manually edited
    if (value && !newValue.includes(value)) {
      onChange('', undefined)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn('pl-9 pr-8', error && 'border-destructive focus-visible:ring-destructive')}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg"
        >
          <ScrollArea className="max-h-60">
            <ul className="p-1">
              {suggestions.map((airport, index) => (
                <li key={airport.iataCode}>
                  <button
                    type="button"
                    onClick={() => selectAirport(airport)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      index === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="font-mono text-xs font-semibold text-accent">
                      {airport.iataCode}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{airport.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {airport.cityName}, {airport.countryName}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

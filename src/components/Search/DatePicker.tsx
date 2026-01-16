import { useState, useMemo } from 'react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
} from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/cn'

type DatePickerProps = {
  id: string
  label: string
  value: string
  onChange: (nextValue: string) => void
  min: string
  error?: string
  optional?: boolean
}

export function DatePicker({ id, label, value, onChange, min, error, optional }: DatePickerProps) {
  const minDate = useMemo(() => parseISO(min), [min])
  const selectedDate = useMemo(() => (value ? parseISO(value) : undefined), [value])
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() =>
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(minDate)
  )

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    const days: Date[] = []
    let cur = start
    while (!isAfter(cur, end)) {
      days.push(cur)
      cur = addDays(cur, 1)
    }
    const rows: Date[][] = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  }, [month])

  const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''

  const handleSelect = (date: Date) => {
    if (isBefore(date, minDate)) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setMonth(selectedDate ? startOfMonth(selectedDate) : startOfMonth(minDate))
    }
  }

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label} {optional && <span className="text-muted-foreground">(optional)</span>}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal cursor-pointer',
              !value && 'text-muted-foreground',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="flex-1 text-left">{displayValue || 'Select date'}</span>
            {value ? (
              <span
                role="button"
                tabIndex={0}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange('')
                  }
                }}
                aria-label={`Clear ${label} date`}
              >
                <X className="size-4" />
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-3" align="start">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setMonth((m) => subMonths(m, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-medium">{format(month, 'MMMM yyyy')}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.flat().map((day) => {
              const disabled = isBefore(day, minDate)
              const outside = !isSameMonth(day, month)
              const selected = selectedDate ? isSameDay(day, selectedDate) : false

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'h-9 rounded-md text-sm transition-colors',
                    'hover:bg-accent hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    outside && 'text-muted-foreground/60',
                    disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                    selected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                  aria-label={format(day, 'yyyy-MM-dd')}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Min: {format(minDate, 'MMM d, yyyy')}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

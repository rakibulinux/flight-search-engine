
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AIRLINE_NAMES } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface AirlineFilterProps {
  airlines: string[]
  availableAirlines: string[]
  onChange: (airlines: string[]) => void
  className?: string
}

export function AirlineFilter({
  airlines,
  availableAirlines,
  onChange,
  className,
}: AirlineFilterProps) {
  const handleToggle = (airline: string) => {
    if (airlines.includes(airline)) {
      onChange(airlines.filter((a) => a !== airline))
    } else {
      onChange([...airlines, airline])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className={cn('', className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Airlines</span>
        {airlines.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto px-2 py-0.5 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {airlines.length === 0 ? (
              <span className="text-muted-foreground">All airlines</span>
            ) : (
              <span>{airlines.length} selected</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Select Airlines</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-60">
            {availableAirlines.map((airline) => (
              <DropdownMenuCheckboxItem
                key={airline}
                checked={airlines.includes(airline)}
                onCheckedChange={() => handleToggle(airline)}
              >
                <span className="font-mono text-xs font-medium text-accent">{airline}</span>
                <span className="ml-2 truncate">
                  {AIRLINE_NAMES[airline] || airline}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected badges */}
      {airlines.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {airlines.slice(0, 3).map((airline) => (
            <Badge
              key={airline}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => handleToggle(airline)}
            >
              {airline}
              <span className="text-muted-foreground hover:text-foreground">×</span>
            </Badge>
          ))}
          {airlines.length > 3 && (
            <Badge variant="outline">+{airlines.length - 3} more</Badge>
          )}
        </div>
      )}
    </div>
  )
}

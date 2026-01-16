import { Clock, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/contexts/SearchContext'
import { formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface RecentSearchesProps {
  className?: string
  onSelect?: () => void
}

export function RecentSearches({ className, onSelect }: RecentSearchesProps) {
  const { recentSearches, clearRecentSearches, dispatch } = useSearch()

  if (recentSearches.length === 0) return null

  const handleSelect = (search: (typeof recentSearches)[0]) => {
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: search.params })
    onSelect?.()
  }

  return (
    <div className={cn('', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="size-4" />
          Recent Searches
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecentSearches}
          className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentSearches.map((search) => (
          <Button
            key={search.id}
            variant="secondary"
            size="sm"
            onClick={() => handleSelect(search)}
            className="group gap-2 pr-2"
          >
            <Plane className="size-3" />
            <span className="font-medium">{search.params.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{search.params.destination}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(search.timestamp)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 8, className }: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header skeleton */}
      <div className="flex gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-20" />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 border-b px-4 py-4"
        >
          {/* Airline */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>

          {/* Route */}
          <Skeleton className="h-4 w-24" />

          {/* Departure */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-2 w-16" />
          </div>

          {/* Arrival */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-2 w-16" />
          </div>

          {/* Duration */}
          <Skeleton className="h-4 w-14" />

          {/* Stops */}
          <Skeleton className="h-5 w-16 rounded-full" />

          {/* Class */}
          <Skeleton className="h-3 w-16" />

          {/* Price */}
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface TablePaginationProps {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  className?: string
}

export function TablePagination({
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const startItem = pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <div className={cn('flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4', className)}>
      {/* Items info - Hidden on very small screens, simplified on mobile */}
      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        <span className="hidden xs:inline">Showing </span>
        <span className="font-medium text-foreground">{startItem}</span>
        <span className="hidden xs:inline"> – </span>
        <span className="xs:hidden">-</span>
        <span className="font-medium text-foreground">{endItem}</span>
        <span className="hidden xs:inline"> of </span>
        <span className="xs:hidden"> / </span>
        <span className="font-medium text-foreground">{totalItems}</span>
        <span className="hidden sm:inline"> results</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {/* Page size selector - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Page <span className="font-medium text-foreground">{pageIndex + 1}</span>
          <span className="hidden xs:inline"> of </span>
          <span className="xs:hidden">/</span>
          <span className="font-medium text-foreground">{pageCount || 1}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
            className="hidden xs:flex"
          >
            <ChevronsLeft className="size-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            className="hidden xs:flex"
          >
            <ChevronsRight className="size-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnOrderState,
  type VisibilityState,
  type PaginationState,
} from '@tanstack/react-table'
import { Plane, Search, AlertCircle, LayoutGrid, LayoutList } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useFlightColumns } from './columns'
import { TableSkeleton } from './TableSkeleton'
import { TablePagination } from './TablePagination'
import { ColumnVisibility } from './ColumnVisibility'
import { FlightCard } from './FlightCard'
import { FlightDetailsDialog } from './FlightDetailsDialog'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_PAGE_SIZE } from '@/utils/constants'
import type { Flight } from '@/types'
import { cn } from '@/utils/cn'

interface DataTableProps {
  data: Flight[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  className?: string
}

export function DataTable({
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  className,
}: DataTableProps) {
  const columns = useFlightColumns()

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewMode, setViewMode] = useLocalStorage<'table' | 'cards'>('flight-search-view-mode', 'table')

  // Persist table layout
  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
    STORAGE_KEYS.COLUMN_VISIBILITY,
    {}
  )
  const [columnOrder, setColumnOrder] = useLocalStorage<ColumnOrderState>(
    STORAGE_KEYS.TABLE_LAYOUT,
    []
  )

  // Local state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'price', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  // Reset pagination when data changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [data.length])

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  })

  // Get paginated data for card view
  const paginatedData = table.getRowModel().rows.map((row) => row.original)

  // Render empty state
  if (!isLoading && data.length === 0 && !isError) {
    return (
      <Card className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Search className="size-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-center">No flights found</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
          Search for flights to see results here. Try different dates or destinations.
        </p>
      </Card>
    )
  }

  // Render error state
  if (isError) {
    return (
      <Card className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-center">Something went wrong</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
          {errorMessage || 'Failed to load flight results. Please try again.'}
        </p>
      </Card>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        {/* Mobile: Card skeletons */}
        <div className="block md:hidden p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
        {/* Desktop: Table skeleton */}
        <div className="hidden md:block">
          <TableSkeleton rows={5} />
        </div>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn('overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <Plane className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {data.length} flight{data.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle - Only on tablet and up */}
            <div className="hidden sm:flex items-center border rounded-md">
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('cards')}
                className="rounded-r-none"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <LayoutList className="size-4" />
              </Button>
            </div>
            {/* Column visibility - Only in table view */}
            {viewMode === 'table' && (
              <div className="hidden lg:block">
                <ColumnVisibility table={table} />
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Always Cards View */}
        <div className="block md:hidden">
          <div className="p-3 space-y-3">
            {paginatedData.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onClick={() => {
                  setSelectedFlight(flight)
                  setIsDetailsOpen(true)
                }}
              />
            ))}
          </div>
        </div>

        {/* Tablet/Desktop: Switchable View */}
        <div className="hidden md:block">
          {viewMode === 'cards' ? (
            // Cards Grid View
            <div className="p-4">
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedData.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onClick={() => {
                      setSelectedFlight(flight)
                      setIsDetailsOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Table View
            <ScrollArea className="relative">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            style={{ width: header.getSize() }}
                            className="relative"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {/* Column resize handle */}
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                                  header.column.getIsResizing()
                                    ? 'bg-accent'
                                    : 'bg-transparent hover:bg-border'
                                )}
                              />
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="row-hover cursor-pointer"
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() => {
                          setSelectedFlight(row.original)
                          setIsDetailsOpen(true)
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>

        <FlightDetailsDialog
          open={isDetailsOpen}
          onOpenChange={(open) => {
            setIsDetailsOpen(open)
            if (!open) setSelectedFlight(null)
          }}
          flight={selectedFlight}
        />

        {/* Pagination */}
        <div className="border-t px-3 sm:px-4">
          <TablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={table.getPageCount()}
            totalItems={data.length}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
            onPageSizeChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
          />
        </div>
      </Card>
    </TooltipProvider>
  )
}

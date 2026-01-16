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
import { Plane, Search, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useFlightColumns } from './columns'
import { TableSkeleton } from './TableSkeleton'
import { TablePagination } from './TablePagination'
import { ColumnVisibility } from './ColumnVisibility'
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

  // Render empty state
  if (!isLoading && data.length === 0 && !isError) {
    return (
      <Card className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Search className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No flights found</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
          Search for flights to see results here. Try different dates or destinations for more options.
        </p>
      </Card>
    )
  }

  // Render error state
  if (isError) {
    return (
      <Card className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Something went wrong</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
          {errorMessage || 'Failed to load flight results. Please try again.'}
        </p>
      </Card>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <TableSkeleton rows={5} />
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn('overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Plane className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {data.length} flight{data.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <ColumnVisibility table={table} />
        </div>

        {/* Table */}
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

        {/* Pagination */}
        <div className="border-t px-4">
          <TablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={table.getPageCount()}
            totalItems={data.length}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
            onPageSizeChange={(size) =>
              setPagination({ pageIndex: 0, pageSize: size })
            }
          />
        </div>
      </Card>
    </TooltipProvider>
  )
}

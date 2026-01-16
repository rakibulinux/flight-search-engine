import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Table } from '@tanstack/react-table'
import { cn } from '@/utils/cn'

interface ColumnVisibilityProps<TData> {
  table: Table<TData>
  className?: string
}

const COLUMN_LABELS: Record<string, string> = {
  airline: 'Airline',
  route: 'Route',
  departure: 'Departure',
  arrival: 'Arrival',
  duration: 'Duration',
  stops: 'Stops',
  class: 'Class',
  price: 'Price',
}

export function ColumnVisibility<TData>({ table, className }: ColumnVisibilityProps<TData>) {
  const columns = table.getAllColumns().filter((col) => col.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <Settings2 className="size-4" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {COLUMN_LABELS[column.id] || column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

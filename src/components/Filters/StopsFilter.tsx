import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { STOP_OPTIONS } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface StopsFilterProps {
  value: number | null
  onChange: (value: number | null) => void
  className?: string
}

export function StopsFilter({ value, onChange, className }: StopsFilterProps) {
  return (
    <div className={cn('', className)}>
      <Label className="mb-2 block text-sm font-medium">Stops</Label>
      <Select
        value={value === null ? 'any' : value.toString()}
        onValueChange={(val) => onChange(val === 'any' ? null : parseInt(val, 10))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Any number of stops" />
        </SelectTrigger>
        <SelectContent>
          {STOP_OPTIONS.map((option) => (
            <SelectItem
              key={option.value === null ? 'any' : option.value}
              value={option.value === null ? 'any' : option.value.toString()}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

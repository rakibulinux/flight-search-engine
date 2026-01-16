import * as React from 'react'
import { cn } from '@/utils/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('skeleton rounded-md bg-muted', className)} {...props} />
}

export { Skeleton }

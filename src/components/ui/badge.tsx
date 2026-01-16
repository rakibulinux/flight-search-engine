import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { badgeVariants } from '@/components/ui/badge-variants'

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }

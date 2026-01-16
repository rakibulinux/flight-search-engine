import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-white shadow',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-white shadow',
        warning: 'border-transparent bg-warning text-warning-foreground shadow',
        accent: 'border-transparent bg-accent text-accent-foreground shadow',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>

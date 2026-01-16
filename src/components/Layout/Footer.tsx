import { Github, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t bg-card py-6', className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with React, TypeScript & Amadeus API
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://developers.amadeus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Amadeus API
              <ExternalLink className="size-3" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Github, ExternalLink, Braces } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t bg-card/80 py-6 backdrop-blur supports-backdrop-filter:bg-card/70',
        className
      )}
    >
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
              href="https://github.com/rakibulinux/flight-search-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <a
              href="https://www.rakibulinux.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Braces className="size-4" />
              Developer
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

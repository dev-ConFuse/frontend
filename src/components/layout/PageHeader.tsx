import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Back-link target; pass null to hide the back link. Defaults to /dashboard. */
  backHref?: string | null
  backLabel?: string
  /** Right-aligned slot (e.g. <ProfileAvatar />). */
  actions?: React.ReactNode
}

/**
 * Shared page header for the authenticated surface (account, billing, ...).
 *
 * WHY: protected pages each rolled their own header — different containers,
 * type scales and auth fallbacks — which reads as inconsistent. One header
 * gives every protected page the same app chrome: full-width bar, optional
 * back link, icon + title + description, and an actions slot.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  backHref = '/dashboard',
  backLabel = 'Back to Dashboard',
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {backHref !== null && (
              <Link
                href={backHref}
                className="mb-2 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                {backLabel}
              </Link>
            )}
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-6 w-6 text-primary" aria-hidden="true" />}
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            </div>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
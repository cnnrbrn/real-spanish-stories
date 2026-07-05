import type * as React from 'react'
import { cn } from '@/lib/utils'

const widths = {
  prose: 'max-w-3xl', // reading / text pages
  wide: 'max-w-7xl', // grid / list / detail app pages
} as const

interface PageContainerProps {
  width?: keyof typeof widths
  className?: string
  children: React.ReactNode
}

export function PageContainer({
  width = 'prose',
  className,
  children,
}: PageContainerProps) {
  return (
    <div className={cn('mx-auto px-4 py-10', widths[width], className)}>
      {children}
    </div>
  )
}

export const pageTitleClass =
  'text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3'
export const pageDescriptionClass = 'text-lg text-muted-foreground mb-8'
export const pageHeaderCenteredClass = 'text-center max-w-4xl mx-auto'

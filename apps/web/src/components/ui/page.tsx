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

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
    </div>
  )
}

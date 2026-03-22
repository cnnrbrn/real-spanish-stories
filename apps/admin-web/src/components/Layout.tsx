import { Suspense } from 'react'
import { useLocation } from '@tanstack/react-router'
import { AppSidebar } from './AppSidebar'
import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const getHeaderTitle = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/stories')) {
      return 'Stories'
    }
    return 'Videos'
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{getHeaderTitle()}</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { Home, BookOpen, Newspaper } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const menuItems = [
  {
    title: 'Videos',
    url: '/',
    icon: Home,
  },
  {
    title: 'Stories',
    url: '/stories',
    icon: BookOpen,
  },
  {
    title: 'News',
    url: '/news',
    icon: Newspaper,
  },
]

export function AppSidebar() {
  const location = useLocation()

  const isActive = (url: string) => {
    if (url === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(url)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <Link to="/">
            <h2 className="text-lg font-semibold">Spanish Creator</h2>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2026 Admin Panel
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

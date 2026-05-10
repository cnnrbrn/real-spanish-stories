import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { usePreferencesStore } from '../stores/preferences'
import AuthMenu from './auth-menu'

const navLinks = [
  { to: '/' as const, label: 'Home', exact: true },
  { to: '/series' as const, label: 'Series' },
  { to: '/how-it-works' as const, label: 'How it works' },
  { to: '/contact' as const, label: 'Contact Us' },
]

export default function Header() {
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img
              src="/logo-light.svg"
              alt="Real Spanish Stories Logo"
              className="h-14 dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="Real Spanish Stories Logo"
              className="h-14 hidden dark:block"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className="font-medium text-foreground hover:text-primary transition-colors mx-2 lg:mx-3"
                activeProps={{
                  className:
                    'font-medium text-primary underline underline-offset-4 transition-colors',
                }}
                activeOptions={exact ? { exact: true } : undefined}
              >
                {label}
              </Link>
            ))}
            <AuthMenu />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, exact }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-foreground hover:text-primary transition-colors py-2"
                  activeProps={{
                    className:
                      'font-medium text-primary underline underline-offset-4 transition-colors py-2',
                  }}
                  activeOptions={exact ? { exact: true } : undefined}
                >
                  {label}
                </Link>
              ))}
              <AuthMenu />
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

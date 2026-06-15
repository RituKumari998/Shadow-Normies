import type { ReactNode } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGhost, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fg text-white shadow-sm">
              <FontAwesomeIcon icon={faGhost} className="text-sm" />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-fg group-hover:text-fg-soft transition">
                Shadow Normies
              </span>
              <p className="text-[11px] font-medium text-muted hidden sm:block">
                Pixel intelligence · Normies Hackathon
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" active={location.pathname === '/'}>
              Explore
            </NavLink>
            <a
              href="https://www.normies.art/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-hover hover:text-fg"
            >
              Normies Tools
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </a>
            <a
              href="https://api.normies.art"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-hover hover:text-fg"
            >
              API
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface/60 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-fg flex items-center justify-center">
                <FontAwesomeIcon icon={faGhost} className="text-white text-[10px]" />
              </div>
              <span className="text-sm font-medium text-fg-soft">Shadow Normies</span>
            </div>
            <p className="text-xs text-muted text-center sm:text-right">
              Built for the Normies Hackathon · Data from{' '}
              <a
                href="https://api.normies.art"
                className="font-medium text-fg hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                api.normies.art
              </a>
              {' · '}
              <a
                href="https://www.normies.art"
                className="font-medium text-fg hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                normies.art
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-fg text-white'
          : 'text-muted hover:bg-surface-hover hover:text-fg'
      }`}
    >
      {children}
    </Link>
  )
}

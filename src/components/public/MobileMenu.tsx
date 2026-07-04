import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'
import { cn } from '@/lib/cn'

type Props = {
  items: PublicNavigationMenuItem[]
  onNavigate?: () => void
}

function linkClass(active: boolean, nested = false) {
  return cn(
    nested ? 'block rounded-lg px-4 py-2.5 pl-8 text-sm font-medium' : 'block rounded-lg px-4 py-3 text-sm font-medium',
    active ? 'text-emerald-700' : 'text-slate-700 hover:bg-slate-50',
  )
}

function NavLeaf({ item, nested, onNavigate }: { item: PublicNavigationMenuItem; nested?: boolean; onNavigate?: () => void }) {
  const href = item.href?.trim() || '#'
  const external = href.startsWith('http')
  if (external || item.openInNewTab) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass(false, nested)}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    )
  }
  return (
    <Link to={href} className={linkClass(false, nested)} onClick={onNavigate}>
      {item.label}
    </Link>
  )
}

export function MobileMenu({ items, onNavigate }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <nav className="space-y-1 px-4 py-3 pb-6">
      {items.map((item) => {
        const hasChildren = item.children.length > 0
        if (!hasChildren) {
          return <NavLeaf key={item.id} item={item} onNavigate={onNavigate} />
        }
        const isOpen = expanded[item.id] ?? false
        return (
          <div key={item.id}>
            <button
              type="button"
              className={cn(linkClass(false), 'flex w-full items-center justify-between')}
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
            >
              <span>{item.label}</span>
              <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen ? (
              <div className="space-y-0.5 pb-1">
                <NavLink
                  to={item.href}
                  className={({ isActive }) => linkClass(isActive, true)}
                  onClick={onNavigate}
                >
                  Tümünü gör
                </NavLink>
                {item.children.map((child) => (
                  <NavLeaf key={child.id} item={child} nested onNavigate={onNavigate} />
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

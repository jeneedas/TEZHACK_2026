import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  FileText,
  ClipboardList,
  ShieldCheck,
  Package,
  Truck,
  History,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    items: [
      {
        label: 'Overview',
        to: '/',
        icon: LayoutDashboard,
      },
      {
        label: 'Live Map',
        to: '/incident-map',
        icon: Map,
      },
    ],
  },

  {
    title: 'Coordination',
    items: [
      {
        label: 'Requests',
        to: '/requests',
        icon: ClipboardList,
      },
      {
        label: 'Reports',
        to: '/reports',
        icon: FileText,
      },
      {
        label: 'Resources',
        to: '/resources',
        icon: Package,
      },
      {
        label: 'Assistance',
        to: '/dispatch',
        icon: Truck,
      },
    ],
  },

  {
    title: 'Trust',
    items: [
      {
        label: 'Verification',
        to: '/verification',
        icon: ShieldCheck,
      },
    ],
  },

  {
    title: 'Records',
    items: [
      {
        label: 'History',
        to: '/history',
        icon: History,
      },
    ],
  },
]

export const Sidebar: React.FC = () => {
  return (
    <aside className="flex h-full w-[228px] flex-shrink-0 flex-col border-r border-border bg-panel">
      <div className="border-b border-border px-4 py-4">
        <div className="text-lg font-bold tracking-tight text-text-primary">
          ZIVA
        </div>

        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          Disaster Response Coordination
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-3">
            {group.title && (
              <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                {group.title}
              </div>
            )}

            <ul>
              {group.items.map((item) => (
                <li key={`${item.label}-${item.to}`}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded px-2.5 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-infobg text-primary'
                          : 'text-text-primary hover:bg-bg'
                      }`
                    }
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3 text-[11px] text-text-secondary">
        <div className="font-semibold text-text-primary">
          Kamrup District, Assam
        </div>
        ZIVA · Coordinator Portal
      </div>
    </aside>
  )
}
import React from 'react'
import { Radio, Bell } from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <header className="flex h-[64px] items-center justify-between border-b border-border bg-panel px-5">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              ZIVA
            </span>

            <span className="hidden text-xs text-text-secondary md:inline">
              Verified Disaster Resource & Assistance Coordination
            </span>
          </div>

          <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Coordinator Portal
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* System status */}
        <div className="hidden items-center gap-2 border border-border rounded px-2.5 py-1 text-xs text-text-secondary sm:flex">
          <Radio size={13} />

          <span className="font-semibold text-text-primary">
            KAMRUP DISTRICT
          </span>

          <span className="flex items-center gap-1 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            ONLINE
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg"
          aria-label="Notifications"
        >
          <Bell size={17} />

          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        {/* Coordinator */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-infobg text-xs font-bold text-primary">
            C
          </div>

          <div className="leading-tight">
            <div className="text-xs font-semibold text-text-primary">
              COORDINATOR
            </div>

            <div className="text-[11px] text-text-secondary">
              District EOC
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
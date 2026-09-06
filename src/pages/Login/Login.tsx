import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ShieldCheck } from 'lucide-react'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-5 text-center">
          <div className="text-2xl font-bold tracking-tight text-text-primary">DRISHTI</div>
          <div className="mt-1 text-xs text-text-secondary">
            Disaster Response Intelligence &amp; Situation Tracking Interface
          </div>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            District Emergency Operations Center
          </div>
        </div>

        <div className="rounded border border-border bg-panel p-6">
          <div className="mb-4 flex items-center gap-2 border border-border bg-infobg px-3 py-2 text-xs text-primary rounded">
            <ShieldCheck size={14} />
            Authorized personnel only. Kamrup District access.
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-4 w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-5 w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <Button type="submit" variant="primary" className="w-full">
              Sign In to EOC Portal
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center text-[11px] text-text-secondary">
          DRISHTI District Administration Portal · Kamrup District, Assam
        </div>
      </div>
    </div>
  )
}

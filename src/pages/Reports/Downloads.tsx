import React, { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Phone } from 'lucide-react'

const downloadOptions = [
  'Incident Report',
  'Response Report',
  'Resource Status',
  'District Situation',
  'Field Verification Data'
]

// PoC contacts — configurable per deployment. Verify local numbers before
// production use.
const emergencyContacts = [
  { label: 'District Emergency Operations Center', number: '1077' },
  { label: 'Police', number: '112' },
  { label: 'Fire & Emergency', number: '101' },
  { label: 'Ambulance', number: '108' }
]

export const Downloads: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState(downloadOptions[0])
  const [date, setDate] = useState('2026-08-30')

  const handleDownload = () => {
    const csvContent = `Report Type,Date\n${selectedOption},${date}\n\nThis is demo export data generated for the DRISHTI PoC.`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedOption.replace(/\s+/g, '_')}_${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Download Data</h1>
        <div className="mt-1 text-sm text-text-secondary">Export operational data for offline reporting</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title="Download Data">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Report Type
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="mb-4 w-full max-w-sm rounded border border-border px-3 py-2 text-sm"
          >
            {downloadOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-5 w-full max-w-sm rounded border border-border px-3 py-2 text-sm"
          />

          <Button variant="primary" onClick={handleDownload}>
            Download
          </Button>

          <p className="mt-4 text-xs text-text-secondary">
            Exports contain demo data generated for this proof-of-concept and are provided in CSV format.
          </p>
        </Panel>

        <Panel title="Emergency Contacts">
          <ul className="space-y-2.5">
            {emergencyContacts.map((c) => (
              <li key={c.label} className="flex items-center justify-between border border-border rounded px-3 py-2.5">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{c.label}</div>
                  <div className="font-mono text-sm text-text-secondary">{c.number}</div>
                </div>
                <a href={`tel:${c.number}`}>
                  <Button size="sm" variant="critical">
                    <Phone size={12} /> Call
                  </Button>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-text-secondary">
            Numbers are configurable for the deployment region. Verify accuracy for your jurisdiction before
            production use.
          </p>
        </Panel>
      </div>
    </div>
  )
}

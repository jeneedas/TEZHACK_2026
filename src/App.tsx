import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { Layout } from './components/Layout/Layout'

import { Login } from './pages/Login/Login'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Situation } from './pages/Situation/Situation'

import { IncidentMapPage } from './pages/Incidents/IncidentMapPage'
import { IncidentReports } from './pages/Incidents/IncidentReports'
import { IncidentDetails } from './pages/IncidentDetails/IncidentDetails'

import { Intelligence } from './pages/Intelligence/Intelligence'
import { InformationFog } from './pages/Intelligence/InformationFog'
import { ReportVerification } from './pages/Intelligence/ReportVerification'

import { Resources } from './pages/Resources/Resources'
import { Dispatch } from './pages/Dispatch/Dispatch'
import { FieldTeams } from './pages/Resources/FieldTeams'

import { Hospitals } from './pages/Hospitals/Hospitals'
import { ReliefCamps } from './pages/ReliefCamps/ReliefCamps'

import { History } from './pages/Reports/History'
import { Downloads } from './pages/Reports/Downloads'


const App: React.FC = () => {
  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* APPLICATION */}

      <Route
        path="/*"
        element={
          <Layout>

            <Routes>

              {/* ─────────────────────────────────────────────
                  COMMAND CENTER
              ───────────────────────────────────────────── */}

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/situation"
                element={<Situation />}
              />

              <Route
                path="/incident-map"
                element={<IncidentMapPage />}
              />


              {/* ─────────────────────────────────────────────
                  COORDINATION
              ───────────────────────────────────────────── */}

              <Route
                path="/requests"
                element={<IncidentReports />}
              />

              <Route
                path="/requests/:id"
                element={<IncidentDetails />}
              />


              {/* ─────────────────────────────────────────────
                  REPORTS
              ───────────────────────────────────────────── */}

              <Route
                path="/reports"
                element={<ReportVerification />}
              />


              {/* ─────────────────────────────────────────────
                  TRUST
              ───────────────────────────────────────────── */}

              <Route
                path="/verification"
                element={<ReportVerification />}
              />

              <Route
                path="/information-fog"
                element={<InformationFog />}
              />

              <Route
                path="/intelligence"
                element={<Intelligence />}
              />


              {/* ─────────────────────────────────────────────
                  RESOURCES
              ───────────────────────────────────────────── */}

              <Route
                path="/resources"
                element={<Resources />}
              />

              <Route
                path="/field-teams"
                element={<FieldTeams />}
              />

              <Route
                path="/hospitals"
                element={<Hospitals />}
              />

              <Route
                path="/relief-camps"
                element={<ReliefCamps />}
              />


              {/* ─────────────────────────────────────────────
                  ASSISTANCE
              ───────────────────────────────────────────── */}

              <Route
                path="/dispatch"
                element={<Dispatch />}
              />


              {/* ─────────────────────────────────────────────
                  RECORDS
              ───────────────────────────────────────────── */}

              <Route
                path="/history"
                element={<History />}
              />

              <Route
                path="/downloads"
                element={<Downloads />}
              />


              {/* ─────────────────────────────────────────────
                  LEGACY REDIRECTS
              ───────────────────────────────────────────── */}

              <Route
                path="/incidents"
                element={<Navigate to="/requests" replace />}
              />

              <Route
                path="/incidents/:id"
                element={<Navigate to="/requests" replace />}
              />

            </Routes>

          </Layout>
        }
      />

    </Routes>
  )
}

export default App
import React, { useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from 'react-leaflet'
import { Locate } from 'lucide-react'

import {
  KAMRUP_BOUNDARY,
  KAMRUP_DISTRICT_CENTER,
  KAMRUP_DEFAULT_ZOOM,
  KAMRUP_PLACES,
} from '../../data/kamrupGeo'

import { useData } from '../../context/DataContext'

import {
  incidentIcons,
  resourceIcon,
  hospitalIcon,
  campIcon,
  placeIcon,
} from './icons'

import { kamrupHospitals } from '../../data/kamrupHospitals'
import { kamrupReliefCamps } from '../../data/kamrupReliefCamps'
import { initialFogAreas } from '../../data/kamrupFog'

import {
  MapLayersControl,
  defaultMapLayers,
  type MapLayers,
} from './MapLayersControl'

import { MapLegend } from '../MapLegend/MapLegend'

import type {
  Incident,
  Resource,
  Hospital,
  ReliefCamp,
} from '../../types'

/*
 * Road status demo segments.
 * These are illustrative and not GPS-accurate.
 */
const roadHazards: {
  id: string
  positions: [number, number][]
  label: string
}[] = [
  {
    id: 'hazard-route-a',
    positions: [
      [26.1, 91.65],
      [26.093, 91.635],
      [26.09, 91.62],
    ],
    label: 'Route A — flooded segment near Village C',
  },
  {
    id: 'hazard-rangia',
    positions: [
      [26.42, 91.6],
      [26.433, 91.617],
    ],
    label: 'Rangia — culvert washout',
  },
]

/*
 * Approximate affected areas.
 * These represent areas where disaster impact has been reported.
 */
const affectedZones: {
  id: string
  center: [number, number]
  radiusM: number
  level: 'critical' | 'high' | 'moderate'
  label: string
}[] = [
  {
    id: 'zone-1',
    center: [26.09, 91.62],
    radiusM: 3200,
    level: 'critical',
    label: 'Village C — critical affected zone',
  },
  {
    id: 'zone-2',
    center: [26.03, 91.44],
    radiusM: 2600,
    level: 'critical',
    label: 'Village H — critical affected zone',
  },
  {
    id: 'zone-3',
    center: [26.166, 91.467],
    radiusM: 3600,
    level: 'high',
    label: 'Palashbari — high affected zone',
  },
  {
    id: 'zone-4',
    center: [25.933, 91.367],
    radiusM: 2200,
    level: 'high',
    label: 'Boko — high affected zone',
  },
  {
    id: 'zone-5',
    center: [26.217, 91.533],
    radiusM: 2000,
    level: 'moderate',
    label: 'Hajo — moderate affected zone',
  },
  {
    id: 'zone-6',
    center: [26.03, 91.395],
    radiusM: 2400,
    level: 'moderate',
    label: 'Village X — moderate affected zone',
  },
]

const zoneColors: Record<
  'critical' | 'high' | 'moderate',
  string
> = {
  critical: '#B42318',
  high: '#B54708',
  moderate: '#1558A6',
}

/*
 * Button to return to the Kamrup district view.
 */
function FitDistrictControl() {
  const map = useMap()

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ marginTop: 56 }}
    >
      <div className="leaflet-control leaflet-bar">
        <button
          className="flex items-center gap-1 bg-white px-2 py-1 text-[11px] font-semibold uppercase text-text-primary hover:bg-bg"
          onClick={() =>
            map.setView(
              KAMRUP_DISTRICT_CENTER,
              KAMRUP_DEFAULT_ZOOM
            )
          }
          title="Fit district view"
        >
          <Locate size={12} />
          Kamrup
        </button>
      </div>
    </div>
  )
}

export interface IncidentMapProps {
  height?: string

  onSelectIncident?: (incident: Incident) => void

  onSelectResource?: (resource: Resource) => void

  onSelectHospital?: (hospital: Hospital) => void

  onSelectCamp?: (camp: ReliefCamp) => void

  showLayersControl?: boolean

  showLegend?: boolean

  defaultLayers?: Partial<MapLayers>

  focusPosition?: [number, number]

  focusZoom?: number
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  height = '620px',

  onSelectIncident,

  onSelectResource,

  onSelectHospital,

  onSelectCamp,

  showLayersControl = true,

  showLegend = true,

  defaultLayers,

  focusPosition,

  focusZoom,
}) => {
  const { incidents, resources } = useData()

  const [layers, setLayers] = useState<MapLayers>({
    ...defaultMapLayers,
    ...defaultLayers,
  })

  /*
   * Active citizen reports.
   */
  const activeIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.status !== 'RESOLVED'
      ),
    [incidents]
  )

  /*
   * Active resources currently responding or on scene.
   */
  const activeResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.status === 'EN_ROUTE' ||
          resource.status === 'ON_SCENE'
      ),
    [resources]
  )

  return (
    <div
      className="relative overflow-hidden rounded border border-border"
      style={{ height }}
    >
      <MapContainer
        center={
          focusPosition ?? KAMRUP_DISTRICT_CENTER
        }
        zoom={
          focusZoom ?? KAMRUP_DEFAULT_ZOOM
        }
        style={{
          height: '100%',
          width: '100%',
        }}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* District boundary */}

        <Polygon
          positions={KAMRUP_BOUNDARY}
          pathOptions={{
            color: '#1558A6',
            weight: 2,
            fillOpacity: 0.03,
            fillColor: '#1558A6',
          }}
        />

        {/* Affected areas */}

        {layers.affectedAreas &&
          affectedZones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radiusM}
              pathOptions={{
                color: zoneColors[zone.level],
                weight: 1,
                fillColor: zoneColors[zone.level],
                fillOpacity: 0.12,
              }}
            >
              <Popup>
                <div className="text-xs">
                  {zone.label}
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Verification / information confidence */}

        {layers.informationFog &&
          initialFogAreas.map((fog) => (
            <Circle
              key={fog.id}
              center={[
                fog.position.lat,
                fog.position.lng,
              ]}
              radius={2600}
              pathOptions={{
                color: '#5F6368',
                weight: 1,
                dashArray: '3,3',
                fillColor: '#5F6368',
                fillOpacity: 0.18,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="mb-1 font-semibold uppercase">
                    {fog.location}
                  </div>

                  <div>
                    Information Confidence:{' '}
                    <b>
                      {100 - fog.fogPercent}%
                    </b>
                  </div>

                  <div>
                    Reports: {fog.reports}
                  </div>

                  <div>
                    Last verified:{' '}
                    {fog.lastVerified}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Road status */}

        {layers.roadHazards &&
          roadHazards.map((hazard) => (
            <Polyline
              key={hazard.id}
              positions={hazard.positions}
              pathOptions={{
                color: '#B42318',
                weight: 3,
                dashArray: '6,4',
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">
                    Road Status
                  </div>

                  <div className="mt-1">
                    {hazard.label}
                  </div>

                  <div className="mt-1 font-semibold text-critical">
                    Restricted
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

        {/* Place labels */}

        {KAMRUP_PLACES.map((place) => (
          <Marker
            key={place.name}
            position={place.position}
            icon={placeIcon}
          >
            <Popup>
              <div className="text-xs font-semibold">
                {place.name}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Citizen Reports */}

        {layers.incidents &&
          activeIncidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[
                incident.position.lat,
                incident.position.lng,
              ]}
              icon={
                incidentIcons[
                  incident.severity
                ]
              }
              eventHandlers={{
                click: () =>
                  onSelectIncident?.(incident),
              }}
            >
              <Popup>
                <div className="min-w-[180px] text-xs">

                  <div className="mb-1 font-bold">
                    {incident.code}
                  </div>

                  <div className="mb-0.5 font-semibold">
                    {incident.name}
                  </div>

                  <div className="mb-1 text-text-secondary">
                    Citizen Report · {incident.typeLabel}
                  </div>

                  <div>
                    Priority:{' '}
                    <b>
                      {incident.priorityScore}/100
                    </b>
                  </div>

                  <div>
                    Confidence:{' '}
                    <b>
                      {incident.confidenceScore}%
                    </b>
                  </div>

                  <div>
                    Affected: ~
                    {incident.affectedPeople}
                  </div>

                  {incident.trappedPeople > 0 && (
                    <div>
                      Trapped:{' '}
                      {incident.trappedPeople}
                    </div>
                  )}

                  <button
                    className="mt-2 w-full rounded border border-primary bg-primary px-2 py-1 text-[11px] font-semibold uppercase text-white"
                    onClick={() =>
                      onSelectIncident?.(
                        incident
                      )
                    }
                  >
                    View Report
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Active Resources */}

        {layers.responseTeams &&
          activeResources.map((resource) => (
            <Marker
              key={resource.id}
              position={[
                resource.position.lat,
                resource.position.lng,
              ]}
              icon={resourceIcon}
              eventHandlers={{
                click: () =>
                  onSelectResource?.(
                    resource
                  ),
              }}
            >
              <Popup>
                <div className="text-xs">

                  <div className="mb-1 font-bold">
                    {resource.name}
                  </div>

                  <div className="text-text-secondary">
                    {resource.typeLabel}
                  </div>

                  <div className="mt-1">
                    Status:{' '}
                    <b>
                      {resource.status.replace(
                        '_',
                        ' '
                      )}
                    </b>
                  </div>

                  {resource.etaMinutes != null && (
                    <div>
                      ETA:{' '}
                      {resource.etaMinutes} min
                    </div>
                  )}

                </div>
              </Popup>
            </Marker>
          ))}

        {/* Medical facilities */}

        {layers.hospitals &&
          kamrupHospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[
                hospital.position.lat,
                hospital.position.lng,
              ]}
              icon={hospitalIcon}
              eventHandlers={{
                click: () =>
                  onSelectHospital?.(
                    hospital
                  ),
              }}
            >
              <Popup>
                <div className="text-xs">

                  <div className="mb-1 font-bold">
                    {hospital.name}
                  </div>

                  <div>
                    Beds: {hospital.beds} · ICU:{' '}
                    {hospital.icu}
                  </div>

                  <div>
                    Status: {hospital.status}
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}

        {/* Shelters */}

        {layers.reliefCamps &&
          kamrupReliefCamps.map((camp) => (
            <Marker
              key={camp.id}
              position={[
                camp.position.lat,
                camp.position.lng,
              ]}
              icon={campIcon}
              eventHandlers={{
                click: () =>
                  onSelectCamp?.(camp),
              }}
            >
              <Popup>
                <div className="text-xs">

                  <div className="mb-1 font-bold">
                    {camp.name}
                  </div>

                  <div>
                    {camp.location}
                  </div>

                  <div>
                    Occupancy:{' '}
                    {camp.occupied}/
                    {camp.capacity}
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}

        <FitDistrictControl />
      </MapContainer>

      {/* Map layers */}

      {showLayersControl && (
        <div className="absolute right-2.5 top-2.5 z-[500]">
          <MapLayersControl
            layers={layers}
            onChange={setLayers}
          />
        </div>
      )}

      {/* Map legend */}

      {showLegend && (
        <div className="absolute bottom-2.5 left-2.5 z-[500]">
          <MapLegend />
        </div>
      )}
    </div>
  )
}
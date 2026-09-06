import L from 'leaflet'

// Simple restrained circular DivIcons — no giant custom markers, no glow.
function circleIcon(color: string, size = 16, border = '#FFFFFF'): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid ${border};
      box-shadow:0 0 0 1px rgba(0,0,0,0.15);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function squareIcon(color: string, size = 14): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:2px;
      background:${color};border:2px solid #FFFFFF;
      box-shadow:0 0 0 1px rgba(0,0,0,0.15);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export const incidentIcons: Record<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', L.DivIcon> = {
  CRITICAL: circleIcon('#B42318', 18),
  HIGH: circleIcon('#B54708', 16),
  MEDIUM: circleIcon('#1558A6', 14),
  LOW: circleIcon('#5F6368', 12)
}

export const resourceIcon = squareIcon('#1558A6', 14)
export const hospitalIcon = squareIcon('#287D3C', 14)
export const campIcon = squareIcon('#7C5CBF', 14)

export const placeIcon = L.divIcon({
  className: '',
  html: `<div style="width:5px;height:5px;border-radius:50%;background:#5F6368;"></div>`,
  iconSize: [5, 5],
  iconAnchor: [2, 2]
})

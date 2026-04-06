'use client'
import type { PlacementZone } from '@/lib/supabase/types'

type Props = {
  productSlug: string | null
  colourHex: string | null
  activeZoneId: string | null
  zones: PlacementZone[]
}

function GarmentShape({ slug }: { slug: string | null }) {
  switch (slug) {
    case 'hoodie':
    case 'sweatshirt-crew':
    case 'sweatshirt-quarter':
      return (
        <g>
          <path d="M55 65 L20 80 L30 95 L30 190 L170 190 L170 95 L180 80 L145 65 L130 50 Q120 38 110 35 Q100 38 90 50 Z" fill="currentColor" />
          <path d="M90 50 Q100 30 110 35 Q120 30 130 50 Q120 42 110 40 Q100 42 90 50Z" fill="currentColor" opacity="0.6" />
          <path d="M20 80 L30 95" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M180 80 L170 95" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M30 175 L170 175" stroke="black" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
        </g>
      )
    case 'tee-oversized':
      return (
        <g>
          <path d="M50 58 L10 80 L25 98 L28 188 L172 188 L175 98 L190 80 L150 58 L135 44 Q110 30 85 44 Z" fill="currentColor" />
          <path d="M10 80 L25 98" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M190 80 L175 98" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        </g>
      )
    case 'jogger':
      return (
        <g>
          <rect x="50" y="30" width="120" height="18" rx="4" fill="currentColor" opacity="0.8" />
          <path d="M50 46 L50 130 Q50 145 60 145 L95 145 L100 210 L120 210 L115 145 L140 145 Q150 145 150 130 L150 46 Z" fill="currentColor" />
          <rect x="88" y="198" width="24" height="14" rx="3" fill="currentColor" opacity="0.7" />
        </g>
      )
    case 'tote-bag':
      return (
        <g>
          <path d="M75 50 Q75 25 90 25 Q105 25 105 50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M115 50 Q115 25 130 25 Q145 25 145 50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
          <rect x="42" y="50" width="136" height="148" rx="4" fill="currentColor" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M50 120 Q50 50 110 45 Q170 50 170 120 Z" fill="currentColor" />
          <path d="M45 120 Q45 132 110 132 Q140 132 175 125 L170 115 Q140 122 110 122 Q75 122 50 120 Z" fill="currentColor" opacity="0.85" />
          <circle cx="110" cy="47" r="5" fill="currentColor" opacity="0.6" />
        </g>
      )
    case 'jacket-twill':
      return (
        <g>
          <path d="M55 58 L18 78 L30 96 L30 188 L170 188 L170 96 L182 78 L145 58 L132 46 Q120 38 108 46 L100 60 L92 46 Q80 38 68 46 Z" fill="currentColor" />
          <rect x="55" y="100" width="28" height="20" rx="2" fill="black" fillOpacity="0.1" />
          <rect x="117" y="100" width="28" height="20" rx="2" fill="black" fillOpacity="0.1" />
        </g>
      )
    default:
      return (
        <g>
          <path d="M60 60 L20 78 L32 94 L32 185 L168 185 L168 94 L180 78 L140 60 L128 48 Q110 36 92 48 Z" fill="currentColor" />
          <path d="M20 78 L32 94" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M180 78 L168 94" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        </g>
      )
  }
}

export default function SVGGarment({ productSlug, colourHex, activeZoneId, zones }: Props) {
  return (
    <svg viewBox="0 0 220 240" width="100%" xmlns="http://www.w3.org/2000/svg"
      style={{ color: colourHex ?? '#1a1a1a', transition: 'color 0.3s ease' }}>
      <GarmentShape slug={productSlug} />
      {zones.map(zone => {
        const x = (zone.x_pct / 100) * 220
        const y = (zone.y_pct / 100) * 240
        const w = (zone.w_pct / 100) * 220
        const h = (zone.h_pct / 100) * 240
        const isActive = zone.id === activeZoneId
        return (
          <rect key={zone.id} x={x} y={y} width={w} height={h} rx="3"
            fill={isActive ? 'rgba(230,48,48,0.1)' : 'transparent'}
            stroke={isActive ? '#e63030' : '#666'}
            strokeWidth={isActive ? 1 : 0.5}
            strokeDasharray="3 2"
            opacity={isActive ? 1 : 0.4}
            style={{ transition: 'all 0.2s ease' }}
          />
        )
      })}
      {zones.filter(z => z.id === activeZoneId).map(zone => (
        <text key={zone.id + '-label'}
          x={(zone.x_pct / 100) * 220 + ((zone.w_pct / 100) * 220) / 2}
          y={(zone.y_pct / 100) * 240 - 4}
          textAnchor="middle" fontSize="7" fill="#e63030"
          fontFamily="Inter, sans-serif">
          {zone.name}
        </text>
      ))}
    </svg>
  )
}

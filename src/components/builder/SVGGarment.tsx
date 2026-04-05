'use client'
import type { PlacementZone } from '@/lib/supabase/types'

type Props = {
  productSlug: string | null
  colourHex: string | null
  activeZoneId: string | null
  zones: PlacementZone[]
}

function getGarmentPath(slug: string | null): React.ReactNode {
  const fill = 'currentColor'
  switch (slug) {
    case 'hoodie':
    case 'sweatshirt-crew':
    case 'sweatshirt-quarter':
      return (
        <g>
          {/* Body */}
          <path d="M55 65 L20 80 L30 95 L30 190 L170 190 L170 95 L180 80 L145 65 L130 50 Q120 38 110 35 Q100 38 90 50 Z" fill={fill} />
          {/* Hood / collar bump */}
          <path d="M90 50 Q100 30 110 35 Q120 30 130 50 Q120 42 110 40 Q100 42 90 50Z" fill={fill} opacity="0.6" />
          {/* Sleeve lines */}
          <path d="M20 80 L30 95" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M180 80 L170 95" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          {/* Hem line */}
          <path d="M30 175 L170 175" stroke="black" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
        </g>
      )
    case 'tee-regular':
      return (
        <g>
          <path d="M60 60 L20 78 L32 94 L32 185 L168 185 L168 94 L180 78 L140 60 L128 48 Q110 36 92 48 Z" fill={fill} />
          <path d="M20 78 L32 94" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M180 78 L168 94" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M32 170 L168 170" stroke="black" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
        </g>
      )
    case 'tee-oversized':
      return (
        <g>
          <path d="M50 58 L10 80 L25 98 L28 188 L172 188 L175 98 L190 80 L150 58 L135 44 Q110 30 85 44 Z" fill={fill} />
          <path d="M10 80 L25 98" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M190 80 L175 98" stroke="black" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <path d="M28 173 L172 173" stroke="black" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
        </g>
      )
    case 'jogger':
      return (
        <g>
          {/* Waistband */}
          <rect x="50" y="30" width="120" height="18" rx="4" fill={fill} opacity="0.8" />
          {/* Body */}
          <path d="M50 46 L50 130 Q50 145 60 145 L95 145 L100 210 L120 210 L115 145 L140 145 Q150 145 150 130 L150 46 Z" fill={fill} />
          {/* Seam */}
          <path d="M100 46 L100 145" stroke="black" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
          {/* Ankle cuffs */}
          <rect x="88" y="198" width="24" height="14" rx="3" fill={fill} opacity="0.7" />
        </g>
      )
    case 'tote-bag':
      return (
        <g>
          {/* Handles */}
          <path d="M75 50 Q75 25 90 25 Q105 25 105 50" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M115 50 Q115 25 130 25 Q145 25 145 50" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Bag body */}
          <rect x="42" y="50" width="136" height="148" rx="4" fill={fill} />
        </g>
      )
    case 'cap':
      return (
        <g>
          {/* Crown */}
          <path d="M50 120 Q50 50 110 45 Q170 50 170 120 Z" fill={fill} />
          {/* Brim */}
          <path d="M45 120 Q45 132 110 132 Q140 132 175 125 L170 115 Q140 122 110 122 Q75 122 50 120 Z" fill={fill} opacity="0.85" />
          {/* Panel seam */}
          <path d="M110 48 L110 120" stroke="black" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
          {/* Button top */}
          <circle cx="110" cy="47" r="5" fill={fill} opacity="0.6" />
        </g>
      )
    case 'jacket-twill':
      return (
        <g>
          <path d="M55 58 L18 78 L30 96 L30 188 L170 188 L170 96 L182 78 L145 58 L132 46 Q120 38 108 46 L100 60 L92 46 Q80 38 68 46 Z" fill={fill} />
          {/* Collar */}
          <path d="M92 46 L100 60 L108 46 Q100 38 92 46Z" fill={fill} opacity="0.5" />
          {/* Button line */}
          <path d="M100 60 L100 188" stroke="black" strokeWidth="0.5" strokeOpacity="0.25" fill="none" />
          {/* Chest pockets */}
          <rect x="55" y="100" width="28" height="20" rx="2" fill="black" fillOpacity="0.1" />
          <rect x="117" y="100" width="28" height="20" rx="2" fill="black" fillOpacity="0.1" />
        </g>
      )
    default:
      return <rect x="40" y="40" width="140" height="160" rx="12" fill={fill} />
  }
}

export default function SVGGarment({ productSlug, colourHex, activeZoneId, zones }: Props) {
  const colour = colourHex ?? '#1a1a1a'

  return (
    <svg
      viewBox="0 0 220 240"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: colour, transition: 'color 0.3s ease' }}
    >
      {/* Garment silhouette */}
      {getGarmentPath(productSlug)}

      {/* Placement zone overlays */}
      {zones.map(zone => {
        const x = (zone.x_pct / 100) * 220
        const y = (zone.y_pct / 100) * 240
        const w = (zone.w_pct / 100) * 220
        const h = (zone.h_pct / 100) * 240
        const isActive = zone.id === activeZoneId

        return (
          <rect
            key={zone.id}
            x={x}
            y={y}
            width={w}
            height={h}
            rx="3"
            fill={isActive ? 'rgba(230,48,48,0.1)' : 'transparent'}
            stroke={isActive ? '#e63030' : '#666'}
            strokeWidth={isActive ? 1 : 0.5}
            strokeDasharray="3 2"
            opacity={isActive ? 1 : 0.4}
            style={{ transition: 'all 0.2s ease' }}
          />
        )
      })}

      {/* Zone label for active zone */}
      {zones.filter(z => z.id === activeZoneId).map(zone => {
        const x = (zone.x_pct / 100) * 220 + ((zone.w_pct / 100) * 220) / 2
        const y = (zone.y_pct / 100) * 240 - 4
        return (
          <text
            key={zone.id + '-label'}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="7"
            fill="#e63030"
            fontFamily="Inter, sans-serif"
          >
            {zone.name}
          </text>
        )
      })}
    </svg>
  )
}

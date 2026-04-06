'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Technique, PlacementZone } from '@/lib/supabase/types'

export default function PanelDecoration({ onDone }: { onDone: () => void }) {
  const { state, update } = useBuilder()
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [zones, setZones] = useState<PlacementZone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTechId, setSelectedTechId] = useState<string | null>(state.techniqueId)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(state.placementZoneId)

  useEffect(() => {
    if (!state.productId) return
    const supabase = createClient()
    Promise.all([
      supabase.from('techniques').select('*').eq('available', true).order('sort_order'),
      supabase.from('placement_zones').select('*').eq('product_id', state.productId),
    ]).then(([techRes, zoneRes]) => {
      setTechniques(techRes.data ?? [])
      setZones(zoneRes.data ?? [])
      setLoading(false)
    })
  }, [state.productId])

  function selectTech(tech: Technique) {
    setSelectedTechId(tech.id)
    update({ techniqueId: tech.id, techniqueName: tech.name, techniqueAdd: tech.price_add_50 })
  }

  function selectZone(zone: PlacementZone) {
    setSelectedZoneId(zone.id)
    update({ placementZoneId: zone.id, placementZoneName: zone.name })
  }

  function getPriceLabel(tech: Technique) {
    const add = tech.price_add_50
    return add === 0 ? 'Included' : `+£${add.toFixed(2)}/unit`
  }

  if (loading) return <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-surface animate-pulse" />)}</div>

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-2">Technique</p>
        <div className="flex flex-col gap-1.5">
          {techniques.map(tech => {
            const isSelected = selectedTechId === tech.id
            const add = tech.price_add_50
            return (
              <button key={tech.id} onClick={() => selectTech(tech)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all
                  ${isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-text-secondary bg-bg'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-text-primary text-sm font-medium">{tech.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                    ${add === 0 ? 'border-green-500/30 text-green-600 bg-green-50' : 'border-amber-500/30 text-amber-600 bg-amber-50'}`}>
                    {getPriceLabel(tech)}
                  </span>
                </div>
                {tech.description && <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{tech.description}</p>}
              </button>
            )
          })}
        </div>
      </div>

      {zones.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-2">Placement</p>
          <div className="flex flex-wrap gap-1.5">
            {zones.map(zone => (
              <button key={zone.id} onClick={() => selectZone(zone)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all
                  ${selectedZoneId === zone.id ? 'bg-accent border-accent text-bg font-semibold' : 'border-border text-text-muted hover:border-text-secondary hover:text-text-primary'}`}>
                {zone.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTechId && selectedZoneId && (
        <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:opacity-90 transition-opacity">
          Next: Logo →
        </button>
      )}
    </div>
  )
}

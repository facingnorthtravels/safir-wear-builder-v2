'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Fabric } from '@/lib/supabase/types'

type Weight = 'lightweight' | 'standard' | 'premium'

export default function PanelFabric({ onDone }: { onDone: () => void }) {
  const { state, update } = useBuilder()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(state.fabricId)
  const [weights, setWeights] = useState<Record<string, Weight>>({})

  useEffect(() => {
    if (!state.productId) return
    const supabase = createClient()
    supabase.from('product_fabrics').select('fabric_id, fabrics(*)').eq('product_id', state.productId).then(({ data }) => {
      const result = (data ?? []).map((row: any) => row.fabrics).filter((f: any) => f?.available)
      setFabrics(result)
      if (result.length === 1 && !selectedId) setSelectedId(result[0].id)
      const defaults: Record<string, Weight> = {}
      result.forEach((f: Fabric) => { defaults[f.id] = 'standard' })
      setWeights(defaults)
      setLoading(false)
    })
  }, [state.productId])

  function getGsm(fabric: Fabric, weight: Weight) {
    const min = fabric.gsm_min ?? 160
    const max = fabric.gsm_max ?? 400
    const def = fabric.gsm_default ?? Math.round((min + max) / 2)
    return weight === 'lightweight' ? min : weight === 'premium' ? max : def
  }

  function handleSelect(fabric: Fabric, weight?: Weight) {
    const w = weight ?? weights[fabric.id] ?? 'standard'
    const gsm = getGsm(fabric, w)
    setSelectedId(fabric.id)
    if (weight) setWeights(prev => ({ ...prev, [fabric.id]: weight }))
    update({ fabricId: fabric.id, fabricName: `${fabric.name} · ${gsm}gsm` })
  }

  if (loading) return <div className="flex flex-col gap-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-surface animate-pulse" />)}</div>

  return (
    <div className="flex flex-col gap-4">
      {fabrics.map(fabric => {
        const isSelected = selectedId === fabric.id
        const weight = weights[fabric.id] ?? 'standard'
        const tiers: { label: string; weight: Weight; gsm: number }[] = [
          { label: 'Light', weight: 'lightweight', gsm: fabric.gsm_min ?? 160 },
          { label: 'Standard', weight: 'standard', gsm: fabric.gsm_default ?? 190 },
          { label: 'Premium', weight: 'premium', gsm: fabric.gsm_max ?? 240 },
        ]
        return (
          <div key={fabric.id} onClick={() => handleSelect(fabric)}
            className={`rounded-lg border transition-all cursor-pointer p-3
              ${isSelected ? 'border-accent' : 'border-border hover:border-text-secondary'} bg-bg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-text-primary text-sm font-medium">{fabric.name}</p>
              {isSelected && <span className="text-accent text-xs">✓</span>}
            </div>
            <p className="text-text-muted text-xs mb-2">{fabric.composition}</p>
            <div className="flex gap-1.5">
              {tiers.map(t => (
                <button key={t.weight}
                  onClick={e => { e.stopPropagation(); handleSelect(fabric, t.weight) }}
                  className={`flex-1 py-1 rounded text-[10px] font-medium border transition-all
                    ${isSelected && weight === t.weight ? 'border-accent bg-accent text-bg' : 'border-border text-text-muted hover:border-text-secondary hover:text-text-primary'}`}>
                  {t.label}<br />{t.gsm}gsm
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {selectedId && (
        <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:opacity-90 transition-opacity">
          Next: Colour →
        </button>
      )}
    </div>
  )
}

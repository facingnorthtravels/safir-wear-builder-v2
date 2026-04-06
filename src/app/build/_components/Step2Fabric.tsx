'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Fabric } from '@/lib/supabase/types'

type Weight = 'lightweight' | 'standard' | 'premium'

export default function Step2Fabric() {
  const { state, update, nextStep, goToStep } = useBuilder()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(state.fabricId)
  const [weights, setWeights] = useState<Record<string, Weight>>({})

  useEffect(() => {
    async function load() {
      if (!state.productId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('product_fabrics').select('fabric_id, fabrics(*)')
        .eq('product_id', state.productId)
      const result = (data ?? []).map((row: any) => row.fabrics).filter((f: any) => f?.available)
      setFabrics(result)
      if (result.length === 1 && !selectedId) setSelectedId(result[0].id)
      const defaults: Record<string, Weight> = {}
      result.forEach((f: Fabric) => { defaults[f.id] = 'standard' })
      setWeights(defaults)
      setLoading(false)
    }
    load()
  }, [state.productId])

  function getGsm(fabric: Fabric, weight: Weight) {
    const min = fabric.gsm_min ?? 160
    const max = fabric.gsm_max ?? 400
    const def = fabric.gsm_default ?? Math.round((min + max) / 2)
    if (weight === 'lightweight') return min
    if (weight === 'premium') return max
    return def
  }

  function handleContinue() {
    const fabric = fabrics.find(f => f.id === selectedId)
    if (!fabric) return
    const weight = weights[fabric.id] ?? 'standard'
    const gsm = getGsm(fabric, weight)
    update({ fabricId: fabric.id, fabricName: `${fabric.name} · ${gsm}gsm` })
    nextStep()
  }

  if (loading) return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-raised border border-border rounded-card h-28 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-text-primary text-lg font-semibold mb-1">Choose your fabric</h2>
        <p className="text-text-muted text-sm">All fabrics are 80% cotton, 20% polyester unless noted.</p>
      </div>
      <div className="flex flex-col gap-3">
        {fabrics.map(fabric => {
          const isSelected = selectedId === fabric.id
          const weight = weights[fabric.id] ?? 'standard'
          const min = fabric.gsm_min ?? 160
          const max = fabric.gsm_max ?? 400
          const def = fabric.gsm_default ?? Math.round((min + max) / 2)
          const tiers: { label: string; weight: Weight; gsm: number }[] = [
            { label: 'Lightweight', weight: 'lightweight', gsm: min },
            { label: 'Standard', weight: 'standard', gsm: def },
            { label: 'Premium', weight: 'premium', gsm: max },
          ]
          return (
            <div key={fabric.id} onClick={() => setSelectedId(fabric.id)}
              className={`p-4 rounded-card border transition-all cursor-pointer
                ${isSelected ? 'border-accent' : 'border-border hover:border-text-secondary'} bg-raised`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-text-primary font-medium text-sm">{fabric.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">{fabric.composition}</p>
                </div>
                {isSelected && <span className="text-accent text-xs font-medium flex-shrink-0">Selected ✓</span>}
              </div>
              <div className="flex gap-2 mb-2">
                {tiers.map(t => (
                  <button key={t.weight}
                    onClick={e => { e.stopPropagation(); setSelectedId(fabric.id); setWeights(w => ({ ...w, [fabric.id]: t.weight })) }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all
                      ${isSelected && weight === t.weight
                        ? 'border-accent bg-accent text-bg font-medium'
                        : 'border-border text-text-muted hover:border-text-secondary hover:text-text-primary'}`}>
                    {t.label} · {t.gsm}gsm
                  </button>
                ))}
              </div>
              {fabric.description && <p className="text-text-muted text-xs">{fabric.description}</p>}
            </div>
          )
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={() => goToStep(1)} className="px-4 py-3 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors">← Back</button>
        <button onClick={handleContinue} disabled={!selectedId}
          className="flex-1 py-3 rounded-lg text-sm font-semibold text-bg bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Continue →
        </button>
      </div>
    </div>
  )
}

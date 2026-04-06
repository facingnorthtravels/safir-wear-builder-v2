'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Fabric } from '@/lib/supabase/types'

export default function Step2Fabric() {
  const { state, update, nextStep, goToStep } = useBuilder()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(state.fabricId)

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
      setLoading(false)
    }
    load()
  }, [state.productId])

  function handleContinue() {
    const fabric = fabrics.find(f => f.id === selectedId)
    if (!fabric) return
    update({ fabricId: fabric.id, fabricName: fabric.name })
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
        <h2 className="text-white text-lg font-medium mb-1">Choose your fabric</h2>
        <p className="text-text-muted text-sm">All fabrics are 80% cotton, 20% polyester unless noted.</p>
      </div>
      <div className="flex flex-col gap-3">
        {fabrics.map(fabric => {
          const isSelected = selectedId === fabric.id
          const min = fabric.gsm_min ?? 160
          const max = fabric.gsm_max ?? 400
          const def = fabric.gsm_default ?? Math.round((min + max) / 2)
          return (
            <button key={fabric.id} onClick={() => setSelectedId(fabric.id)}
              className={`text-left p-4 rounded-card border transition-all w-full
                ${isSelected ? 'border-accent bg-accent/5' : 'border-border bg-raised hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-white font-medium text-sm">{fabric.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">{fabric.composition}</p>
                </div>
                {isSelected && <span className="text-accent text-xs font-medium">Selected ✓</span>}
              </div>
              <div className="flex gap-2 mb-2">
                {[{ label: 'Lightweight', gsm: min, isDefault: false }, { label: 'Standard', gsm: def, isDefault: true }, { label: 'Premium', gsm: max, isDefault: false }].map(t => (
                  <span key={t.label} className={`text-xs px-2.5 py-1 rounded-full border
                    ${t.isDefault ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted'}`}>
                    {t.label} · {t.gsm}gsm
                  </span>
                ))}
              </div>
              {fabric.description && <p className="text-text-muted text-xs">{fabric.description}</p>}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={() => goToStep(1)} className="px-4 py-3 rounded-lg text-sm text-text-muted hover:text-white transition-colors">← Back</button>
        <button onClick={handleContinue} disabled={!selectedId}
          className="flex-1 py-3 rounded-lg text-sm font-medium text-white bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Continue →
        </button>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Colour } from '@/lib/supabase/types'

function isLight(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return 0.299*r + 0.587*g + 0.114*b > 160
}

export default function Step3Colour() {
  const { state, update, nextStep, goToStep } = useBuilder()
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(state.colourId)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('colours').select('*').eq('available', true).order('sort_order')
      setColours(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const selected = colours.find(c => c.id === selectedId)

  function handleContinue() {
    if (!selected) return
    update({ colourId: selected.id, colourName: selected.name, colourHex: selected.hex })
    nextStep()
  }

  if (loading) return <div className="flex flex-wrap gap-3">{Array.from({length:10}).map((_,i)=><div key={i} className="w-11 h-11 rounded-full bg-raised animate-pulse"/>)}</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-lg font-medium mb-1">Choose a colour</h2>
        <p className="text-text-muted text-sm">All colours available from MOQ 50 unless noted.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {colours.map(colour => (
          <button key={colour.id} onClick={() => setSelectedId(colour.id)} title={colour.name}
            className="flex flex-col items-center gap-1.5 group">
            <div className={`w-11 h-11 rounded-full transition-all
              ${selectedId === colour.id ? 'ring-2 ring-white ring-offset-2 ring-offset-bg scale-110' : 'hover:scale-105'}
              ${isLight(colour.hex) ? 'border border-border' : ''}`}
              style={{ backgroundColor: colour.hex }} />
            <span className="text-[10px] text-text-muted group-hover:text-white transition-colors max-w-[48px] text-center leading-tight">
              {colour.name}
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="bg-raised border border-border rounded-card p-4 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isLight(selected.hex) ? 'border border-border' : ''}`}
            style={{ backgroundColor: selected.hex }} />
          <div>
            <p className="text-white text-sm font-medium">{selected.name}</p>
            {selected.pantone && <p className="text-text-muted text-xs">Pantone: {selected.pantone}</p>}
          </div>
          {selected.moq_override && (
            <div className="ml-auto text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-2 py-1">
              ⚠ Min. {selected.moq_override} units
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={() => goToStep(2)} className="px-4 py-3 rounded-lg text-sm text-text-muted hover:text-white transition-colors">← Back</button>
        <button onClick={handleContinue} disabled={!selectedId}
          className="flex-1 py-3 rounded-lg text-sm font-medium text-white bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Continue →
        </button>
      </div>
    </div>
  )
}

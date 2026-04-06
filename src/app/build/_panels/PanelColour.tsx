'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Colour } from '@/lib/supabase/types'

function isLight(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return true
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

function isValidHex(hex: string) { return /^#[0-9a-f]{6}$/i.test(hex) }

type Mode = 'palette' | 'custom'

export default function PanelColour({ onDone }: { onDone: () => void }) {
  const { state, update } = useBuilder()
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<Mode>('palette')
  const [selectedId, setSelectedId] = useState<string | null>(state.colourId)
  const [customHex, setCustomHex] = useState(state.colourHex ?? '#ffffff')
  const [hexInput, setHexInput] = useState((state.colourHex ?? '#ffffff').replace('#', ''))

  useEffect(() => {
    const supabase = createClient()
    supabase.from('colours').select('*').eq('available', true).order('sort_order')
      .then(({ data }) => { setColours(data ?? []); setLoading(false) })
  }, [])

  const selected = colours.find(c => c.id === selectedId)
  const canContinue = mode === 'palette' ? !!selectedId : isValidHex(customHex)

  function selectPalette(colour: Colour) {
    setSelectedId(colour.id)
    update({ colourId: colour.id, colourName: colour.name, colourHex: colour.hex })
  }

  function handleHexInput(val: string) {
    setHexInput(val)
    const full = '#' + val
    if (isValidHex(full)) { setCustomHex(full); update({ colourId: null, colourName: 'Custom ' + full.toUpperCase(), colourHex: full }) }
  }

  function handlePickerChange(val: string) {
    setCustomHex(val); setHexInput(val.replace('#', ''))
    update({ colourId: null, colourName: 'Custom ' + val.toUpperCase(), colourHex: val })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border">
        {(['palette', 'custom'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={'flex-1 py-1.5 rounded-md text-xs font-medium transition-all ' +
              (mode === m ? 'bg-raised border border-border text-text-primary' : 'text-text-muted hover:text-text-primary')}>
            {m === 'palette' ? 'Pantone' : 'Custom hex'}
          </button>
        ))}
      </div>

      {mode === 'palette' && (
        <>
          {loading ? (
            <div className="flex flex-wrap gap-2">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-surface animate-pulse" />)}</div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {colours.map(colour => (
                <button key={colour.id} onClick={() => selectPalette(colour)} title={colour.pantone ? `${colour.name} · Pantone ${colour.pantone}` : colour.name}
                  className="flex flex-col items-center gap-1 group">
                  <div className={'w-9 h-9 rounded-full transition-all ' +
                    (selectedId === colour.id ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg scale-110 ' : 'hover:scale-105 ') +
                    (isLight(colour.hex) ? 'border border-border' : '')}
                    style={{ backgroundColor: colour.hex }} />
                  <span className="text-[9px] text-text-muted group-hover:text-text-primary transition-colors max-w-[40px] text-center leading-tight">
                    {colour.name}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="flex items-center gap-2.5 bg-bg border border-border rounded-lg p-3">
              <div className={'w-7 h-7 rounded-full flex-shrink-0 ' + (isLight(selected.hex) ? 'border border-border' : '')} style={{ backgroundColor: selected.hex }} />
              <div className="min-w-0">
                <p className="text-text-primary text-xs font-semibold">{selected.name}</p>
                {selected.pantone && <p className="text-text-muted text-[10px]">Pantone {selected.pantone}</p>}
                <p className="text-text-muted text-[10px] font-mono">{selected.hex.toUpperCase()}</p>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'custom' && (
        <div className="bg-bg border border-border rounded-lg p-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer group flex-shrink-0">
              <div className="w-12 h-12 rounded-lg border-2 border-border transition-all group-hover:scale-105"
                style={{ backgroundColor: isValidHex(customHex) ? customHex : '#ffffff' }} />
              <input type="color" value={isValidHex(customHex) ? customHex : '#ffffff'}
                onChange={e => handlePickerChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            </label>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-2 bg-raised focus-within:border-accent transition-colors">
                <span className="text-text-muted text-xs font-mono">#</span>
                <input type="text" value={hexInput} onChange={e => handleHexInput(e.target.value)}
                  placeholder="1a1a18" maxLength={6}
                  className="flex-1 bg-transparent text-text-primary text-xs font-mono outline-none placeholder:text-text-muted uppercase" />
              </div>
              <p className="text-text-muted text-[10px] mt-1">Click swatch to open picker</p>
            </div>
          </div>
        </div>
      )}

      {canContinue && (
        <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:opacity-90 transition-opacity">
          Next: Decoration →
        </button>
      )}
    </div>
  )
}

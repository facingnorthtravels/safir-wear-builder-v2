'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Colour } from '@/lib/supabase/types'

function isLight(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

function isValidHex(hex: string) {
  return /^#[0-9a-f]{6}$/i.test(hex)
}

type Mode = 'palette' | 'custom'

export default function Step3Colour() {
  const { state, update, nextStep, goToStep } = useBuilder()
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

  const selectedPalette = colours.find(c => c.id === selectedId)
  const canContinue = mode === 'palette' ? !!selectedId : isValidHex(customHex)

  function handleHexInput(val: string) {
    setHexInput(val)
    const full = '#' + val
    if (isValidHex(full)) setCustomHex(full)
  }

  function handleContinue() {
    if (mode === 'palette' && selectedPalette) {
      update({ colourId: selectedPalette.id, colourName: selectedPalette.name, colourHex: selectedPalette.hex })
    } else if (mode === 'custom' && isValidHex(customHex)) {
      update({ colourId: null, colourName: 'Custom ' + customHex.toUpperCase(), colourHex: customHex })
    } else return
    nextStep()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-text-primary text-lg font-semibold mb-1">Choose a colour</h2>
        <p className="text-text-muted text-sm">Select from our Pantone palette or enter a custom hex colour.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border w-fit">
        {(['palette', 'custom'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={'px-4 py-1.5 rounded-md text-sm font-medium transition-all ' +
              (mode === m ? 'bg-raised border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary')}>
            {m === 'palette' ? 'Pantone palette' : 'Custom hex'}
          </button>
        ))}
      </div>

      {mode === 'palette' && (
        <>
          {loading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-10 h-10 rounded-full bg-surface animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {colours.map(colour => (
                <button key={colour.id} onClick={() => setSelectedId(colour.id)} title={colour.pantone ?? colour.name}
                  className="flex flex-col items-center gap-1.5 group">
                  <div
                    className={'w-10 h-10 rounded-full transition-all ' +
                      (selectedId === colour.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-110 ' : 'hover:scale-105 ') +
                      (isLight(colour.hex) ? 'border border-border' : '')}
                    style={{ backgroundColor: colour.hex }}
                  />
                  <span className="text-[10px] text-text-muted group-hover:text-text-primary transition-colors max-w-[48px] text-center leading-tight">
                    {colour.name}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedPalette && (
            <div className="bg-raised border border-border rounded-card p-4 flex items-center gap-3">
              <div
                className={'w-8 h-8 rounded-full flex-shrink-0 ' + (isLight(selectedPalette.hex) ? 'border border-border' : '')}
                style={{ backgroundColor: selectedPalette.hex }}
              />
              <div>
                <p className="text-text-primary text-sm font-medium">{selectedPalette.name}</p>
                {selectedPalette.pantone && <p className="text-text-muted text-xs">Pantone {selectedPalette.pantone}</p>}
                <p className="text-text-muted text-xs font-mono">{selectedPalette.hex.toUpperCase()}</p>
              </div>
              {selectedPalette.moq_override && (
                <div className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  Min. {selectedPalette.moq_override} units
                </div>
              )}
            </div>
          )}
        </>
      )}

      {mode === 'custom' && (
        <div className="bg-raised border border-border rounded-card p-5">
          <div className="flex items-start gap-4">
            <label className="relative cursor-pointer group flex-shrink-0">
              <div
                className={'w-16 h-16 rounded-xl border-2 transition-all group-hover:scale-105 ' +
                  (isValidHex(customHex) ? 'border-border' : 'border-red-300')}
                style={{ backgroundColor: isValidHex(customHex) ? customHex : '#ffffff' }}
              />
              <input
                type="color"
                value={isValidHex(customHex) ? customHex : '#ffffff'}
                onChange={e => { setCustomHex(e.target.value); setHexInput(e.target.value.replace('#', '')) }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-medium text-text-muted">Click</span>
            </label>
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium mb-2">Hex colour code</p>
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent transition-colors">
                <span className="text-text-muted text-sm font-mono">#</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={e => handleHexInput(e.target.value)}
                  placeholder="1a1a18"
                  maxLength={6}
                  className="flex-1 bg-transparent text-text-primary text-sm font-mono outline-none placeholder:text-text-muted uppercase"
                />
                {isValidHex(customHex) && (
                  <span className="text-text-muted text-xs">{isLight(customHex) ? 'Light' : 'Dark'}</span>
                )}
              </div>
              <p className="text-text-muted text-xs mt-2">Click the swatch or type a hex code. Custom colours may require higher MOQ.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => goToStep(2)} className="px-4 py-3 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors">Back</button>
        <button onClick={handleContinue} disabled={!canContinue}
          className="flex-1 py-3 rounded-lg text-sm font-semibold text-bg bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Continue →
        </button>
      </div>
    </div>
  )
}

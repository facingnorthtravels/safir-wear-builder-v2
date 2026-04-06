'use client'
import { useEffect, useRef, useState } from 'react'
import { BuilderProvider, useBuilder } from '@/context/BuilderContext'
import SVGGarment from '@/components/builder/SVGGarment'
import { createClient } from '@/lib/supabase/client'
import type { PlacementZone, Product, ProductVariant, Fabric, Colour, Technique } from '@/lib/supabase/types'
import PanelProduct from './_panels/PanelProduct'
import PanelFabric from './_panels/PanelFabric'
import PanelColour from './_panels/PanelColour'
import PanelDecoration from './_panels/PanelDecoration'
import PanelLogo from './_panels/PanelLogo'

// ─── Icons ───────────────────────────────────────────────────────────────────

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  product:    'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 12H8',
  fabric:     'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  colour:     'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  decoration: 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
  logo:       'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  generate:   'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

type PanelKey = 'product' | 'fabric' | 'colour' | 'decoration' | 'logo'

const NAV: { key: PanelKey; label: string; iconKey: keyof typeof ICONS }[] = [
  { key: 'product',    label: 'Product',    iconKey: 'product' },
  { key: 'fabric',     label: 'Fabric',     iconKey: 'fabric' },
  { key: 'colour',     label: 'Colour',     iconKey: 'colour' },
  { key: 'decoration', label: 'Decoration', iconKey: 'decoration' },
  { key: 'logo',       label: 'Logo',       iconKey: 'logo' },
]

// ─── Right summary panel ──────────────────────────────────────────────────────

function SummarySection({ label, value, icon }: { label: string; value: string | null; icon?: string }) {
  return (
    <div className="border-t border-border py-3 px-4">
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-1.5">{label}</p>
      {value
        ? <p className="text-text-primary text-sm font-medium">{value}</p>
        : <p className="text-text-muted text-sm italic">Not selected</p>
      }
    </div>
  )
}

function RightPanel() {
  const { state, estimatedTotal, unitPrice } = useBuilder()
  const [generating, setGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    setGeneratedImageUrl(null)
    setGenerateError(null)
  }, [state.colourHex, state.techniqueId, state.placementZoneId, state.productSlug])

  const canGenerate = !!(state.productSlug && state.colourHex && state.techniqueId && state.placementZoneId)

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: state.productSlug,
          productName: state.productName,
          colourName: state.colourName,
          colourHex: state.colourHex,
          techniqueName: state.techniqueName,
          placementZoneName: state.placementZoneName,
          logoDataUrl: state.logoFileUrl ?? null,
        }),
      })
      const data = await res.json()
      if (data.imageUrl) setGeneratedImageUrl(data.imageUrl)
      else setGenerateError(data.error ?? 'Generation failed.')
    } catch { setGenerateError('Network error.') }
    finally { setGenerating(false) }
  }

  return (
    <div className="w-64 flex-shrink-0 flex flex-col border-l border-border bg-raised overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-xs uppercase tracking-widest text-text-muted font-medium">Design Summary</p>
        {state.productName && (
          <p className="text-text-primary font-semibold text-sm mt-1">{state.productName}</p>
        )}
        {state.variantName && (
          <p className="text-text-muted text-xs">{state.variantName}</p>
        )}
      </div>

      {/* AI Preview */}
      <div className="px-4 py-3 border-b border-border">
        <div className="rounded-lg overflow-hidden bg-surface border border-border" style={{ aspectRatio: '4/5' }}>
          {generatedImageUrl ? (
            <img src={generatedImageUrl} alt="AI preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-4 leading-relaxed">
              {canGenerate ? 'Click Generate to preview' : 'Complete your build to generate a preview'}
            </div>
          )}
          {generating && (
            <div className="absolute inset-0 bg-bg/80 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
              <p className="text-text-muted text-xs">Generating...</p>
            </div>
          )}
        </div>
        {canGenerate && (
          <button onClick={handleGenerate} disabled={generating}
            className="mt-2 w-full py-2 text-xs font-semibold rounded-lg bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50">
            {generating ? 'Generating...' : generatedImageUrl ? '↺ Regenerate' : '✦ Generate AI preview'}
          </button>
        )}
        {generateError && <p className="text-red-500 text-xs mt-1 text-center">{generateError}</p>}
      </div>

      {/* Summary rows */}
      <div className="flex-1">
        <SummarySection label="Product"    value={state.productName} />
        <SummarySection label="Fabric"     value={state.fabricName} />
        <SummarySection label="Colour"     value={state.colourName
          ? `${state.colourName}${state.colourHex ? ' · ' + state.colourHex.toUpperCase() : ''}`
          : null} />
        <SummarySection label="Decoration" value={state.techniqueName} />
        <SummarySection label="Placement"  value={state.placementZoneName} />
        <SummarySection label="Logo"       value={state.logoFileUrl ? 'Uploaded' : null} />
      </div>

      {/* Price & CTA */}
      <div className="px-4 py-4 border-t border-border">
        <div className="mb-3">
          <p className="text-text-muted text-xs mb-0.5">Estimated total</p>
          {state.basePriceGbp > 0 ? (
            <>
              <p className="text-2xl font-bold text-text-primary">
                £{estimatedTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-text-muted text-xs">£{unitPrice.toFixed(2)}/unit · {state.quantity} units</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-text-muted">£—</p>
          )}
        </div>
        <button
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-bg bg-accent transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!(state.productId && state.fabricId && state.colourHex && state.techniqueId)}>
          Request quote →
        </button>
      </div>
    </div>
  )
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function BuilderApp() {
  const { state } = useBuilder()
  const [activePanel, setActivePanel] = useState<PanelKey | null>('product')
  const [zones, setZones] = useState<PlacementZone[]>([])

  useEffect(() => {
    if (!state.productId) { setZones([]); return }
    const supabase = createClient()
    supabase.from('placement_zones').select('*').eq('product_id', state.productId)
      .then(({ data }) => setZones(data ?? []))
  }, [state.productId])

  function togglePanel(key: PanelKey) {
    setActivePanel(prev => prev === key ? null : key)
  }

  return (
    <div className="flex h-full overflow-hidden bg-bg">

      {/* ── Left icon sidebar ── */}
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-1 border-r border-border bg-raised z-10">
        {NAV.map(item => {
          const isActive = activePanel === item.key
          const isDone = (
            (item.key === 'product' && !!state.productId) ||
            (item.key === 'fabric' && !!state.fabricId) ||
            (item.key === 'colour' && !!state.colourHex) ||
            (item.key === 'decoration' && !!state.techniqueId) ||
            (item.key === 'logo' && !!state.logoFileUrl)
          )
          return (
            <button key={item.key} onClick={() => togglePanel(item.key)}
              title={item.label}
              className={`relative w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] font-medium
                ${isActive ? 'bg-accent text-bg' : isDone ? 'text-accent hover:bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}>
              <Icon d={ICONS[item.iconKey]} size={16} />
              <span>{item.label}</span>
              {isDone && !isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Slide-out panel drawer ── */}
      <div className={`flex-shrink-0 border-r border-border bg-raised overflow-y-auto transition-all duration-200 ease-in-out
        ${activePanel ? 'w-72' : 'w-0 border-0 overflow-hidden'}`}>
        {activePanel && (
          <div className="w-72">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-raised z-10">
              <p className="text-text-primary font-semibold text-sm capitalize">{activePanel}</p>
              <button onClick={() => setActivePanel(null)} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded">
                <Icon d="M18 6L6 18M6 6l12 12" size={16} />
              </button>
            </div>
            <div className="p-4">
              {activePanel === 'product'    && <PanelProduct onDone={() => setActivePanel('fabric')} />}
              {activePanel === 'fabric'     && <PanelFabric  onDone={() => setActivePanel('colour')} />}
              {activePanel === 'colour'     && <PanelColour  onDone={() => setActivePanel('decoration')} />}
              {activePanel === 'decoration' && <PanelDecoration onDone={() => setActivePanel('logo')} />}
              {activePanel === 'logo'       && <PanelLogo    onDone={() => setActivePanel(null)} />}
            </div>
          </div>
        )}
      </div>

      {/* ── Center canvas ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Canvas top bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-raised">
          <p className="text-text-muted text-xs">
            {state.productName
              ? <span className="text-text-primary font-medium">{state.productName}</span>
              : <span>Select a product to begin</span>}
            {state.variantName && <span className="text-text-muted"> · {state.variantName}</span>}
          </p>
          <div className="flex items-center gap-1 text-text-muted text-xs">
            {state.colourHex && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-border inline-block" style={{ backgroundColor: state.colourHex }} />
                {state.colourName}
              </span>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center bg-[#f7f3ed] relative overflow-hidden">
          <div className="w-full max-w-md mx-auto px-8">
            <SVGGarment
              productSlug={state.productSlug}
              colourHex={state.colourHex}
              activeZoneId={state.placementZoneId}
              zones={zones}
            />
          </div>
          {/* Empty state hint */}
          {!state.productId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-text-muted text-sm">← Select a product to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas bottom bar */}
        <div className="px-6 py-2.5 border-t border-border bg-raised flex items-center justify-between text-xs text-text-muted">
          <span>Garment preview</span>
          <span className="flex items-center gap-3">
            {state.placementZoneName && <span className="text-accent">Zone: {state.placementZoneName}</span>}
          </span>
        </div>
      </div>

      {/* ── Right summary panel ── */}
      <RightPanel />
    </div>
  )
}

// ─── Page wrapper (strips layout padding) ────────────────────────────────────

export default function BuildPage() {
  return (
    <BuilderProvider>
      <div className="fixed inset-0 top-14 flex flex-col">
        <BuilderApp />
      </div>
    </BuilderProvider>
  )
}

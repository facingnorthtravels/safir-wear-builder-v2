'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { BuilderProvider, useBuilder } from '@/context/BuilderContext'
import SVGGarment from '@/components/builder/SVGGarment'
import { createClient } from '@/lib/supabase/client'
import type { PlacementZone } from '@/lib/supabase/types'
import PanelProduct from './_panels/PanelProduct'
import PanelFabric from './_panels/PanelFabric'
import PanelColour from './_panels/PanelColour'
import PanelDecoration from './_panels/PanelDecoration'
import PanelLogo from './_panels/PanelLogo'

// ─── Icons ────────────────────────────────────────────────────────────────────

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
}

type PanelKey = 'product' | 'fabric' | 'colour' | 'decoration' | 'logo'

const NAV: { key: PanelKey; label: string; iconKey: keyof typeof ICONS }[] = [
  { key: 'product',    label: 'Product',    iconKey: 'product' },
  { key: 'fabric',     label: 'Fabric',     iconKey: 'fabric' },
  { key: 'colour',     label: 'Colour',     iconKey: 'colour' },
  { key: 'decoration', label: 'Decoration', iconKey: 'decoration' },
  { key: 'logo',       label: 'Logo',       iconKey: 'logo' },
]

// ─── Right summary panel ──────────────────────────────────────────────────────

function SummaryRow({ label, value, hex }: { label: string; value: string | null; hex?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-border last:border-0">
      <span className="text-text-muted text-xs flex-shrink-0">{label}</span>
      <span className="flex items-center gap-1.5 text-right">
        {hex && <span className="w-3 h-3 rounded-full border border-border flex-shrink-0 inline-block" style={{ backgroundColor: hex }} />}
        <span className={`text-xs font-medium ${value ? 'text-text-primary' : 'text-text-muted'}`}>{value ?? '—'}</span>
      </span>
    </div>
  )
}

function RightPanel() {
  const { state, estimatedTotal, unitPrice } = useBuilder()
  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-l border-border bg-raised overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium">Design Summary</p>
        {state.productName
          ? <p className="text-text-primary font-semibold text-sm mt-1 leading-tight">{state.productName}{state.variantName ? <span className="text-text-muted font-normal"> · {state.variantName}</span> : ''}</p>
          : <p className="text-text-muted text-xs mt-1 italic">No product selected</p>
        }
      </div>

      <div className="px-4 py-1 flex-1">
        <SummaryRow label="Fabric"     value={state.fabricName} />
        <SummaryRow label="Colour"     value={state.colourName} hex={state.colourHex} />
        <SummaryRow label="Decoration" value={state.techniqueName} />
        <SummaryRow label="Placement"  value={state.placementZoneName} />
        <SummaryRow label="Logo"       value={state.logoFileUrl ? 'Uploaded ✓' : null} />
      </div>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium mb-1">Estimated total</p>
        {state.basePriceGbp > 0 ? (
          <>
            <p className="text-2xl font-bold text-text-primary leading-none">
              £{estimatedTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-text-muted text-xs mt-1">£{unitPrice.toFixed(2)}/unit · {state.quantity} units</p>
          </>
        ) : (
          <p className="text-2xl font-bold text-text-muted leading-none">£—</p>
        )}
        <button
          className="mt-3 w-full py-2.5 rounded-lg text-sm font-semibold text-bg bg-accent transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!(state.productId && state.fabricId && state.colourHex && state.techniqueId)}>
          Request quote →
        </button>
      </div>
    </div>
  )
}

// ─── Center canvas with auto-generate ────────────────────────────────────────

// Default T-Shirt base image shown before any product is selected
const DEFAULT_BASE_IMAGE = 'https://cquddgwugzdrfjpjnyji.supabase.co/storage/v1/object/public/product-bases/tee-regular/base.jpg'

function Canvas() {
  const { state } = useBuilder()
  const [zones, setZones] = useState<PlacementZone[]>([])
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(DEFAULT_BASE_IMAGE)
  const [displayUrl, setDisplayUrl] = useState<string | null>(DEFAULT_BASE_IMAGE)
  const [generating, setGenerating] = useState(false)
  const [generatingOver, setGeneratingOver] = useState(false) // show overlay without clearing current image
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load zones when product changes
  useEffect(() => {
    if (!state.productId) { setZones([]); return }
    const supabase = createClient()
    supabase.from('placement_zones').select('*').eq('product_id', state.productId)
      .then(({ data }) => setZones(data ?? []))
  }, [state.productId])

  // When product changes, fetch its base image and reset display
  useEffect(() => {
    if (!state.productSlug) {
      setBaseImageUrl(DEFAULT_BASE_IMAGE)
      setDisplayUrl(DEFAULT_BASE_IMAGE)
      return
    }
    const supabase = createClient()
    supabase.from('products').select('base_image_url').eq('slug', state.productSlug).single()
      .then(({ data }) => {
        const url = data?.base_image_url ?? null
        setBaseImageUrl(url)
        setDisplayUrl(url) // reset to base when product switches
      })
  }, [state.productSlug])

  // Auto-generate whenever colour, technique, placement or logo changes
  const canGenerate = !!(state.productSlug && state.colourHex && state.techniqueId && state.placementZoneId && baseImageUrl)

  const generate = useCallback(async () => {
    if (!canGenerate) return
    setGeneratingOver(true)
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
      if (data.imageUrl) setDisplayUrl(data.imageUrl)
    } catch {}
    finally { setGeneratingOver(false) }
  }, [state.productSlug, state.colourHex, state.techniqueId, state.placementZoneId, state.logoFileUrl, canGenerate])

  // Debounce so rapid selections don't fire multiple requests
  useEffect(() => {
    if (!canGenerate) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { generate() }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [state.colourHex, state.techniqueId, state.placementZoneId, state.logoFileUrl])

  const hasBase = !!baseImageUrl

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-border bg-raised text-xs">
        <span className="text-text-primary font-medium">
          {state.productName ?? 'T-Shirt'}
          {state.variantName && <span className="text-text-muted font-normal"> · {state.variantName}</span>}
        </span>
        <span className="flex items-center gap-3 text-text-muted">
          {state.colourHex && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: state.colourHex }} />
              {state.colourName}
            </span>
          )}
          {generatingOver && (
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin inline-block" />
              Updating...
            </span>
          )}
        </span>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-[#f7f3ed] relative overflow-hidden">
        {hasBase ? (
          <div className="relative h-full flex items-center justify-center">
            <img
              src={displayUrl ?? baseImageUrl!}
              alt="Product preview"
              className="h-full max-h-full w-auto object-contain"
              style={{ transition: 'opacity 0.3s ease' }}
            />
            {generatingOver && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                <div className="bg-bg/90 border border-border rounded-full px-4 py-2 flex items-center gap-2 text-sm text-text-primary shadow-sm">
                  <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Applying changes...
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback SVG for products without a base image
          <div className="w-full max-w-sm px-12">
            <SVGGarment
              productSlug={state.productSlug}
              colourHex={state.colourHex}
              activeZoneId={state.placementZoneId}
              zones={zones}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-2 border-t border-border bg-raised flex items-center justify-between text-xs text-text-muted">
        <span>{hasBase ? 'AI-generated preview' : 'Garment preview'}</span>
        {state.placementZoneName && <span className="text-accent">Placement: {state.placementZoneName}</span>}
      </div>
    </div>
  )
}

// ─── Main app ─────────────────────────────────────────────────────────────────

function BuilderApp() {
  const { state } = useBuilder()
  const [activePanel, setActivePanel] = useState<PanelKey | null>('product')

  function togglePanel(key: PanelKey) {
    setActivePanel(prev => prev === key ? null : key)
  }

  return (
    <div className="flex h-full overflow-hidden bg-bg">

      {/* Left icon sidebar */}
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-1 border-r border-border bg-raised z-10">
        {NAV.map(item => {
          const isActive = activePanel === item.key
          const isDone = (
            (item.key === 'product'    && !!state.productId) ||
            (item.key === 'fabric'     && !!state.fabricId) ||
            (item.key === 'colour'     && !!state.colourHex) ||
            (item.key === 'decoration' && !!state.techniqueId) ||
            (item.key === 'logo'       && !!state.logoFileUrl)
          )
          return (
            <button key={item.key} onClick={() => togglePanel(item.key)} title={item.label}
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

      {/* Slide-out panel */}
      <div className={`flex-shrink-0 border-r border-border bg-raised overflow-y-auto transition-all duration-200 ease-in-out
        ${activePanel ? 'w-72' : 'w-0 border-0 overflow-hidden'}`}>
        {activePanel && (
          <div className="w-72">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-raised z-10">
              <p className="text-text-primary font-semibold text-sm capitalize">{activePanel}</p>
              <button onClick={() => setActivePanel(null)} className="text-text-muted hover:text-text-primary p-1 rounded transition-colors">
                <Icon d="M18 6L6 18M6 6l12 12" size={16} />
              </button>
            </div>
            <div className="p-4">
              {activePanel === 'product'    && <PanelProduct    onDone={() => setActivePanel('fabric')} />}
              {activePanel === 'fabric'     && <PanelFabric     onDone={() => setActivePanel('colour')} />}
              {activePanel === 'colour'     && <PanelColour     onDone={() => setActivePanel('decoration')} />}
              {activePanel === 'decoration' && <PanelDecoration onDone={() => setActivePanel('logo')} />}
              {activePanel === 'logo'       && <PanelLogo       onDone={() => setActivePanel(null)} />}
            </div>
          </div>
        )}
      </div>

      {/* Center canvas */}
      <Canvas />

      {/* Right summary */}
      <RightPanel />
    </div>
  )
}

export default function BuildPage() {
  return (
    <BuilderProvider>
      <div className="fixed inset-0 top-14 flex flex-col">
        <BuilderApp />
      </div>
    </BuilderProvider>
  )
}

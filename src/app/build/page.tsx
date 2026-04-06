'use client'
import { useEffect, useState } from 'react'
import { BuilderProvider, useBuilder } from '@/context/BuilderContext'
import StepNav from '@/components/builder/StepNav'
import SVGGarment from '@/components/builder/SVGGarment'
import Step1Product from './_components/Step1Product'
import Step2Fabric from './_components/Step2Fabric'
import Step3Colour from './_components/Step3Colour'
import Step4Decoration from './_components/Step4Decoration'
import { createClient } from '@/lib/supabase/client'
import type { PlacementZone } from '@/lib/supabase/types'

function PreviewPanel() {
  const { state, estimatedTotal, unitPrice } = useBuilder()
  const [zones, setZones] = useState<PlacementZone[]>([])
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    if (!state.productId) { setZones([]); return }
    const supabase = createClient()
    supabase.from('placement_zones').select('*').eq('product_id', state.productId)
      .then(({ data }) => setZones(data ?? []))
  }, [state.productId])

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
        })
      })
      const data = await res.json()
      if (data.imageUrl) setGeneratedImageUrl(data.imageUrl)
      else setGenerateError(data.error ?? 'Generation failed. Try again.')
    } catch { setGenerateError('Network error. Try again.') }
    finally { setGenerating(false) }
  }

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-6 bg-raised border border-border rounded-card p-5 flex flex-col gap-4">
        <p className="text-xs text-text-muted uppercase tracking-widest font-medium">Your build</p>

        {/* Preview area */}
        <div className="relative rounded-lg overflow-hidden bg-surface" style={{ aspectRatio: '3/4' }}>
          {generatedImageUrl ? (
            <img src={generatedImageUrl} alt="AI generated preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <SVGGarment
                productSlug={state.productSlug}
                colourHex={state.colourHex}
                activeZoneId={state.placementZoneId}
                zones={zones}
              />
            </div>
          )}
          {generating && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">Generating preview...</p>
              <p className="text-white/50 text-xs">Usually 5–10 seconds</p>
            </div>
          )}
        </div>

        {/* Generate button */}
        {canGenerate && !generating && (
          <button onClick={handleGenerate}
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-150">
            {generatedImageUrl ? '↺ Regenerate preview' : '✦ Generate AI preview'}
          </button>
        )}
        {generateError && <p className="text-red-400 text-xs text-center">{generateError}</p>}

        {/* Config summary */}
        <div className="flex flex-col gap-2 text-sm border-t border-border pt-3">
          {[
            { label: 'Product', value: state.productName },
            { label: 'Variant', value: state.variantName },
            { label: 'Fabric', value: state.fabricName },
            { label: 'Colour', value: state.colourName },
            { label: 'Decoration', value: state.techniqueName },
            { label: 'Placement', value: state.placementZoneName },
            { label: 'Quantity', value: state.basePriceGbp > 0 ? `${state.quantity} units` : null },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-text-muted flex-shrink-0">{label}</span>
              <span className={`text-right truncate ${value ? 'text-white' : 'text-text-muted'}`}>{value ?? '—'}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="border-t border-border pt-3">
          {state.basePriceGbp > 0 ? (
            <>
              <p className="text-2xl font-medium text-white">£{estimatedTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-text-muted mt-1">£{unitPrice.toFixed(2)} per unit · {state.quantity} units</p>
            </>
          ) : (
            <p className="text-2xl font-medium text-text-muted">£—</p>
          )}
        </div>

        <button disabled={state.step !== 6}
          className="w-full py-3 rounded-lg text-sm font-medium text-white bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Submit quote →
        </button>
      </div>
    </div>
  )
}

function BuilderContent() {
  const { state } = useBuilder()
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            <StepNav />
            {state.step === 1 && <Step1Product />}
            {state.step === 2 && <Step2Fabric />}
            {state.step === 3 && <Step3Colour />}
            {state.step === 4 && <Step4Decoration />}
            {state.step === 5 && (
              <div className="bg-raised border border-border rounded-card p-8 text-text-muted text-sm">
                Step 5 — Quantity coming soon
              </div>
            )}
            {state.step === 6 && (
              <div className="bg-raised border border-border rounded-card p-8 text-text-muted text-sm">
                Step 6 — Contact details coming soon
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BuildPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  )
}

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

  useEffect(() => {
    if (!state.productId) { setZones([]); return }
    const supabase = createClient()
    supabase
      .from('placement_zones')
      .select('*')
      .eq('product_id', state.productId)
      .then(({ data }) => setZones(data ?? []))
  }, [state.productId])

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-6 bg-raised border border-border rounded-card p-5 flex flex-col gap-4">
        <p className="text-xs text-text-muted uppercase tracking-widest font-medium">Your build</p>

        {/* SVG Garment preview */}
        <div className="rounded-lg overflow-hidden bg-surface flex items-center justify-center p-4">
          <SVGGarment
            productSlug={state.productSlug}
            colourHex={state.colourHex}
            activeZoneId={state.placementZoneId}
            zones={zones}
          />
        </div>

        {/* Config summary */}
        <div className="flex flex-col gap-2 text-sm">
          {[
            { label: 'Product', value: state.productName },
            { label: 'Variant', value: state.variantName },
            { label: 'Fabric', value: state.fabricName },
            { label: 'Colour', value: state.colourName },
            { label: 'Decoration', value: state.techniqueName },
            { label: 'Placement', value: state.placementZoneName },
            { label: 'Quantity', value: state.quantity > 0 && state.basePriceGbp > 0 ? `${state.quantity} units` : null },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-text-muted flex-shrink-0">{label}</span>
              <span className={`text-right truncate ${value ? 'text-white' : 'text-text-muted'}`}>
                {value ?? '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="border-t border-border pt-4">
          {state.basePriceGbp > 0 ? (
            <>
              <p className="text-2xl font-medium text-white">
                £{estimatedTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-text-muted mt-1">
                £{unitPrice.toFixed(2)} per unit · {state.quantity} units
              </p>
            </>
          ) : (
            <p className="text-2xl font-medium text-text-muted">£—</p>
          )}
        </div>

        {/* Submit button */}
        <button
          disabled={state.step !== 6}
          className="w-full py-3 rounded-lg text-sm font-medium text-white bg-accent transition-opacity
            disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90"
        >
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
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <StepNav />
            {state.step === 1 && <Step1Product />}
            {state.step === 2 && <Step2Fabric />}
            {state.step === 3 && <Step3Colour />}
            {state.step === 4 && <Step4Decoration />}
            {state.step > 4 && (
              <div className="bg-raised border border-border rounded-card p-8 text-text-muted text-sm">
                Step {state.step} content coming soon
              </div>
            )}
          </div>

          {/* Right column — hidden on mobile */}
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

'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type BuilderState = {
  step: number
  productId: string | null
  productSlug: string | null
  productName: string | null
  variantId: string | null
  variantName: string | null
  fabricId: string | null
  fabricName: string | null
  colourId: string | null
  colourName: string | null
  colourHex: string | null
  techniqueId: string | null
  techniqueName: string | null
  techniqueAdd: number
  placementZoneId: string | null
  placementZoneName: string | null
  quantity: 50 | 100 | 500
  basePriceGbp: number
  sizeBreakdown: Record<string, number>
  logoFileUrl: string | null
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  additionalNotes: string
}

const defaultState: BuilderState = {
  step: 1,
  productId: null, productSlug: null, productName: null,
  variantId: null, variantName: null,
  fabricId: null, fabricName: null,
  colourId: null, colourName: null, colourHex: null,
  techniqueId: null, techniqueName: null, techniqueAdd: 0,
  placementZoneId: null, placementZoneName: null,
  quantity: 50, basePriceGbp: 0,
  sizeBreakdown: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
  logoFileUrl: null,
  companyName: '', contactName: '', contactEmail: '',
  contactPhone: '', additionalNotes: '',
}

type BuilderContextType = {
  state: BuilderState
  update: (partial: Partial<BuilderState>) => void
  nextStep: () => void
  goToStep: (step: number) => void
  estimatedTotal: number
  unitPrice: number
}

const BuilderContext = createContext<BuilderContextType | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuilderState>(defaultState)

  useEffect(() => {
    const saved = sessionStorage.getItem('safir-builder')
    if (saved) {
      try { setState(JSON.parse(saved)) } catch {}
    }
  }, [])

  function update(partial: Partial<BuilderState>) {
    setState(prev => {
      const next = { ...prev, ...partial }
      sessionStorage.setItem('safir-builder', JSON.stringify(next))
      return next
    })
  }

  function nextStep() {
    setState(prev => {
      const next = { ...prev, step: Math.min(prev.step + 1, 6) }
      sessionStorage.setItem('safir-builder', JSON.stringify(next))
      return next
    })
  }

  function goToStep(step: number) { update({ step }) }

  const unitPrice = state.basePriceGbp + state.techniqueAdd
  const estimatedTotal = unitPrice * state.quantity

  return (
    <BuilderContext.Provider value={{ state, update, nextStep, goToStep, estimatedTotal, unitPrice }}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}

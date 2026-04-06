'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Technique, PlacementZone } from '@/lib/supabase/types'

export default function Step4Decoration() {
  const { state, update, nextStep, goToStep } = useBuilder()
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [zones, setZones] = useState<PlacementZone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTechId, setSelectedTechId] = useState<string | null>(state.techniqueId)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(state.placementZoneId)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [techRes, zoneRes] = await Promise.all([
        supabase.from('techniques').select('*').eq('available', true).order('sort_order'),
        supabase.from('placement_zones').select('*').eq('product_id', state.productId ?? ''),
      ])
      setTechniques(techRes.data ?? [])
      setZones(zoneRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [state.productId])

  useEffect(() => {
    if (selectedZoneId !== state.placementZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId)
      update({ placementZoneId: selectedZoneId, placementZoneName: zone?.name ?? null })
    }
  }, [selectedZoneId, zones])

  function getPriceAdd(tech: Technique) {
    if (state.quantity === 100) return tech.price_add_100
    if (state.quantity === 500) return tech.price_add_500
    return tech.price_add_50
  }

  async function handleContinue() {
    const tech = techniques.find(t => t.id === selectedTechId)
    const zone = zones.find(z => z.id === selectedZoneId)
    if (!tech || !zone) return

    let logoFileUrl: string | null = state.logoFileUrl ?? null
    if (logoFile) {
      logoFileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(logoFile)
      })
    }

    update({ techniqueId: tech.id, techniqueName: tech.name,
      techniqueAdd: getPriceAdd(tech), placementZoneId: zone.id,
      placementZoneName: zone.name, logoFileUrl })
    nextStep()
  }

  if (loading) return (
    <div className="flex flex-col gap-3">
      {Array.from({length:3}).map((_,i)=><div key={i} className="bg-raised border border-border rounded-card h-20 animate-pulse"/>)}
    </div>
  )

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-text-primary text-lg font-medium mb-1">Decoration</h2>
        <p className="text-text-muted text-sm">Choose how your logo or design will be applied.</p>
      </div>
      <div>
        <p className="text-text-primary text-sm font-medium mb-3">Technique</p>
        <div className="grid grid-cols-2 gap-3">
          {techniques.map(tech => {
            const add = getPriceAdd(tech)
            const isSelected = selectedTechId === tech.id
            return (
              <button key={tech.id} onClick={() => setSelectedTechId(tech.id)}
                className={`text-left p-4 rounded-card border transition-all
                  ${isSelected ? 'border-accent bg-accent/5' : 'border-border bg-raised hover:border-border'}`}>
                <p className="text-text-primary text-sm font-medium mb-1">{tech.name}</p>
                {tech.description && <p className="text-text-muted text-xs mb-2 line-clamp-2">{tech.description}</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full border
                  ${add === 0 ? 'border-green-500/30 text-green-400 bg-green-400/10' : 'border-amber-500/30 text-amber-400 bg-amber-400/10'}`}>
                  {add === 0 ? 'Included' : `+£${add.toFixed(2)} / unit`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-text-primary text-sm font-medium mb-3">Placement</p>
        <div className="flex flex-wrap gap-2">
          {zones.map(zone => (
            <button key={zone.id} onClick={() => setSelectedZoneId(zone.id)}
              className={`px-4 py-2 rounded-full text-sm border transition-all
                ${selectedZoneId === zone.id ? 'bg-accent border-accent text-text-primary' : 'border-border text-text-muted hover:border-border hover:text-text-primary'}`}>
              {zone.name}
            </button>
          ))}
        </div>
        {selectedZoneId && <p className="text-text-muted text-xs mt-2">Zone highlighted on garment preview →</p>}
      </div>
      <div>
        <p className="text-text-primary text-sm font-medium mb-3">Your logo</p>
        <div onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-card p-8 text-center cursor-pointer hover:border-border transition-colors">
          {logoFile ? (
            <div>
              <p className="text-text-primary text-sm font-medium">{logoFile.name}</p>
              <p className="text-text-muted text-xs mt-1">{(logoFile.size/1024).toFixed(0)}KB · Click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-text-primary text-sm mb-1">Upload your logo</p>
              <p className="text-text-muted text-xs">SVG, PNG or PDF · Max 10MB</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".svg,.png,.pdf" className="hidden" onChange={e => {
          const f = e.target.files?.[0] ?? null
          setLogoFile(f)
        }} />
        <p className="text-text-muted text-xs mt-2">Optional — you can also email it after submitting.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => goToStep(3)} className="px-4 py-3 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors">← Back</button>
        <button onClick={handleContinue} disabled={!selectedTechId || !selectedZoneId}
          className="flex-1 py-3 rounded-lg text-sm font-medium text-text-primary bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
          Continue →
        </button>
      </div>
    </div>
  )
}

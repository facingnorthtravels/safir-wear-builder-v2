'use client'
import { useRef, useState } from 'react'
import { useBuilder } from '@/context/BuilderContext'

export default function PanelLogo({ onDone }: { onDone: () => void }) {
  const { state, update } = useBuilder()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(state.logoFileUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLogoFile(file)
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    setPreview(dataUrl)
    update({ logoFileUrl: dataUrl })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-xs leading-relaxed">
        Upload your logo and it will be applied to the garment in the AI preview. Accepted: SVG, PNG, PDF. Max 10MB.
      </p>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-text-secondary transition-colors">
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img src={preview} alt="Logo preview" className="max-h-20 max-w-full object-contain rounded" />
            <p className="text-text-muted text-xs">{logoFile?.name ?? 'Uploaded'} · Click to change</p>
          </div>
        ) : (
          <div>
            <p className="text-text-primary text-sm font-medium mb-1">Drop your logo here</p>
            <p className="text-text-muted text-xs">or click to browse</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept=".svg,.png,.pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {preview && (
        <button onClick={() => { setPreview(null); setLogoFile(null); update({ logoFileUrl: null }) }}
          className="text-text-muted text-xs hover:text-text-primary transition-colors text-center">
          Remove logo
        </button>
      )}

      <p className="text-text-muted text-xs">Optional — you can also email it after submitting.</p>

      <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:opacity-90 transition-opacity">
        Done ✓
      </button>
    </div>
  )
}

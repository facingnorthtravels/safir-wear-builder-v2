'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Product, ProductVariant } from '@/lib/supabase/types'

type ProductWithVariants = Product & { variants: ProductVariant[] }

export default function Step1Product() {
  const { state, update, nextStep } = useBuilder()
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: prods, error: err } = await supabase
          .from('products').select('*').eq('available', true).order('sort_order')
        if (err) throw err
        const withVariants = await Promise.all(
          (prods ?? []).map(async (p) => {
            const { data: variants } = await supabase
              .from('product_variants').select('*')
              .eq('product_id', p.id).eq('available', true)
            return { ...p, variants: variants ?? [] }
          })
        )
        setProducts(withVariants)
        if (state.productId) {
          const found = withVariants.find(p => p.id === state.productId)
          if (found) { setSelectedProduct(found); setSelectedVariantId(state.variantId) }
        }
      } catch { setError(true) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  function selectProduct(product: ProductWithVariants) {
    setSelectedProduct(product)
    setSelectedVariantId(product.variants.length === 1 ? product.variants[0].id : null)
  }

  function handleContinue() {
    if (!selectedProduct || !selectedVariantId) return
    const variant = selectedProduct.variants.find(v => v.id === selectedVariantId)
    update({ productId: selectedProduct.id, productSlug: selectedProduct.slug,
      productName: selectedProduct.name, variantId: selectedVariantId,
      variantName: variant?.name ?? null })
    nextStep()
  }

  if (error) return (
    <div className="bg-raised border border-border rounded-card p-8 text-center">
      <p className="text-text-muted text-sm">Unable to load products. Contact us on WhatsApp: <a href="https://wa.me/447435782146" className="text-accent">+44 7435 782146</a></p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-lg font-medium mb-1">Choose your product</h2>
        <p className="text-text-muted text-sm">Select the garment you want to customise.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-raised border border-border rounded-card h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => {
            const isSelected = selectedProduct?.id === product.id
            return (
              <button key={product.id} onClick={() => selectProduct(product)}
                className={`text-left p-4 rounded-card border transition-all
                  ${isSelected ? 'border-accent bg-accent/5' : 'border-border bg-raised hover:border-white/20'}`}>
                <div className="w-10 h-10 mb-3 opacity-40">
                  <svg viewBox="0 0 40 40" fill="none">
                    <path d="M8 12 L0 18 L8 21 L8 38 L32 38 L32 21 L40 18 L32 12 L26 8 Q20 5 14 8 Z" fill="currentColor" className="text-white" />
                  </svg>
                </div>
                <p className={`font-medium text-sm mb-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>{product.name}</p>
                <p className="text-text-muted text-xs capitalize">{product.category}</p>
                {product.description && <p className="text-text-muted text-xs mt-1 line-clamp-2">{product.description}</p>}
              </button>
            )
          })}
        </div>
      )}
      {selectedProduct && selectedProduct.variants.length > 1 && (
        <div>
          <p className="text-white text-sm font-medium mb-2">Select fit</p>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.variants.map(variant => (
              <button key={variant.id} onClick={() => setSelectedVariantId(variant.id)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all
                  ${selectedVariantId === variant.id ? 'bg-accent border-accent text-white' : 'border-border text-text-muted hover:border-white/30 hover:text-white'}`}>
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={handleContinue} disabled={!selectedProduct || !selectedVariantId}
        className="w-full py-3 rounded-lg text-sm font-medium text-white bg-accent transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:opacity-90">
        Continue →
      </button>
    </div>
  )
}

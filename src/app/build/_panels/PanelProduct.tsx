'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBuilder } from '@/context/BuilderContext'
import type { Product, ProductVariant } from '@/lib/supabase/types'

type ProductWithVariants = Product & { variants: ProductVariant[] }

export default function PanelProduct({ onDone }: { onDone: () => void }) {
  const { state, update } = useBuilder()
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(state.variantId)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('products').select('*').eq('available', true).order('sort_order').then(async ({ data }) => {
      const withVariants = await Promise.all((data ?? []).map(async p => {
        const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', p.id).eq('available', true)
        return { ...p, variants: variants ?? [] }
      }))
      setProducts(withVariants)
      if (state.productId) {
        const found = withVariants.find(p => p.id === state.productId)
        if (found) { setSelectedProduct(found); setSelectedVariantId(state.variantId) }
      }
      setLoading(false)
    })
  }, [])

  function selectProduct(p: ProductWithVariants) {
    setSelectedProduct(p)
    const vid = p.variants.length === 1 ? p.variants[0].id : null
    setSelectedVariantId(vid)
    const variant = p.variants.find(v => v.id === vid)
    update({ productId: p.id, productSlug: p.slug, productName: p.name, variantId: vid, variantName: variant?.name ?? null })
  }

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId)
    const variant = selectedProduct?.variants.find(v => v.id === variantId)
    update({ variantId, variantName: variant?.name ?? null })
  }

  if (loading) return <div className="flex flex-col gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />)}</div>

  const categories = [...new Set(products.map(p => p.category))]

  return (
    <div className="flex flex-col gap-5">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-2">{cat}</p>
          <div className="flex flex-col gap-1.5">
            {products.filter(p => p.category === cat).map(product => {
              const isSelected = selectedProduct?.id === product.id
              return (
                <button key={product.id} onClick={() => selectProduct(product)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all
                    ${isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-text-secondary bg-bg'}`}>
                  <p className="text-text-primary text-sm font-medium">{product.name}</p>
                  {product.description && <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{product.description}</p>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedProduct && selectedProduct.variants.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-2">Fit</p>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.variants.map(v => (
              <button key={v.id} onClick={() => selectVariant(v.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all
                  ${selectedVariantId === v.id ? 'bg-accent border-accent text-bg font-semibold' : 'border-border text-text-muted hover:border-text-secondary hover:text-text-primary'}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedProduct && (selectedProduct.variants.length === 1 || selectedVariantId) && (
        <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:opacity-90 transition-opacity">
          Next: Fabric →
        </button>
      )}
    </div>
  )
}

export type Product = {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  available: boolean
  sort_order: number
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  available: boolean
}

export type Fabric = {
  id: string
  name: string
  composition: string
  gsm_min: number | null
  gsm_max: number | null
  gsm_default: number | null
  description: string | null
  available: boolean
}

export type Colour = {
  id: string
  name: string
  hex: string
  pantone: string | null
  moq_override: number | null
  available: boolean
  sort_order: number
}

export type Technique = {
  id: string
  name: string
  description: string | null
  price_add_50: number
  price_add_100: number
  price_add_500: number
  available: boolean
  sort_order: number
}

export type PlacementZone = {
  id: string
  product_id: string
  name: string
  x_pct: number
  y_pct: number
  w_pct: number
  h_pct: number
}

export type PricingTier = {
  id: string
  product_id: string
  quantity: number
  base_price_gbp: number
}

export type Quote = {
  id: string
  reference: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  product_id: string
  variant_id: string | null
  fabric_id: string | null
  colour_id: string | null
  technique_id: string | null
  placement_zone_id: string | null
  quantity: number
  size_breakdown: Record<string, number> | null
  estimated_unit_price: number | null
  estimated_total: number | null
  logo_file_url: string | null
  additional_notes: string | null
  status: 'new' | 'reviewing' | 'quoted' | 'won' | 'lost'
  created_at: string
}

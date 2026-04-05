import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return Response.json({ status: 'ok', productCount: count })
  } catch (err) {
    return Response.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    )
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productSlug, productName, colourName, colourHex, techniqueName, placementZoneName } = body

    const cacheKey = `${productSlug}-${colourHex}-${techniqueName}-${placementZoneName}`
      .toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const { data: cached } = await adminClient
      .from('generated_previews').select('image_url').eq('cache_key', cacheKey).single()

    if (cached?.image_url) {
      return Response.json({ imageUrl: cached.image_url, cached: true })
    }

    const { data: product } = await adminClient
      .from('products').select('base_image_url').eq('slug', productSlug).single()

    if (!product?.base_image_url) {
      return Response.json({ error: 'No base image for this product' }, { status: 404 })
    }

    const imageResponse = await fetch(product.base_image_url)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    const prompt = `Edit this fashion product photograph. Make these exact changes:
1. Change the t-shirt colour to ${colourName} (hex ${colourHex}). Preserve all fabric texture, folds, shadows and lighting. Must look like a real garment, not a filter.
2. Remove any existing logo or graphic from the shirt completely.
3. Add a realistic ${techniqueName} decoration on the ${placementZoneName} of the shirt. Show the text "BRAND" in a clean minimal font that looks genuinely ${techniqueName.toLowerCase()} onto the fabric.
4. Keep everything else completely unchanged — model, pose, background, trousers, shoes, lighting.
5. Photorealistic fashion photography quality only.`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      } as any,
    })

    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
      { text: prompt }
    ])

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    console.log('Gemini parts:', parts.map((p: any) => ({
      hasText: !!p.text, hasImage: !!p.inlineData, mimeType: p.inlineData?.mimeType
    })))

    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart?.inlineData?.data) {
      const textPart = parts.find((p: any) => p.text)
      console.error('No image returned. Text:', textPart?.text)
      return Response.json({ error: 'Gemini did not return an image. Check server logs.' }, { status: 500 })
    }

    const generatedBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const storagePath = `generated/${cacheKey}.png`

    const { error: storageError } = await adminClient.storage
      .from('product-bases')
      .upload(storagePath, generatedBuffer, { contentType: 'image/png', upsert: true })

    if (storageError) throw new Error(storageError.message)

    const { data: urlData } = adminClient.storage.from('product-bases').getPublicUrl(storagePath)
    const imageUrl = urlData.publicUrl

    await adminClient.from('generated_previews').insert({
      cache_key: cacheKey, image_url: imageUrl,
      product_slug: productSlug, colour_name: colourName,
      colour_hex: colourHex, technique_name: techniqueName,
      placement_zone_name: placementZoneName,
    })

    return Response.json({ imageUrl, cached: false })

  } catch (err: any) {
    console.error('Generate preview error:', err)
    return Response.json({ error: err.message ?? 'Generation failed' }, { status: 500 })
  }
}

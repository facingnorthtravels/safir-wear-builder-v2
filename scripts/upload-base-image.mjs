import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const { error: bucketError } = await supabase.storage.createBucket(
    'product-bases',
    { public: true }
  )
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Bucket error:', bucketError)
    process.exit(1)
  }

  const filePath = resolve('./scripts/base-tee.jfif')
  const file = readFileSync(filePath)

  const { error: uploadError } = await supabase.storage
    .from('product-bases')
    .upload('tee-regular/base.jpg', file, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    process.exit(1)
  }

  const { data: urlData } = supabase.storage
    .from('product-bases')
    .getPublicUrl('tee-regular/base.jpg')

  console.log('Uploaded to:', urlData.publicUrl)

  const { error: updateError } = await supabase
    .from('products')
    .update({ base_image_url: urlData.publicUrl })
    .eq('slug', 'tee-regular')

  if (updateError) {
    console.error('DB update error:', updateError)
    process.exit(1)
  }

  console.log('Done — base_image_url saved for tee-regular')
}

main()

create table if not exists generated_previews (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  image_url text not null,
  product_slug text,
  colour_name text,
  colour_hex text,
  technique_name text,
  placement_zone_name text,
  created_at timestamptz default now()
);

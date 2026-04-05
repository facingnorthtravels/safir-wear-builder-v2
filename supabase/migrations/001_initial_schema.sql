-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Product variants (fit options)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  available boolean default true
);

-- Fabrics
create table fabrics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  composition text not null,
  gsm_min int,
  gsm_max int,
  gsm_default int,
  description text,
  available boolean default true
);

-- Which fabrics are compatible with which products
create table product_fabrics (
  product_id uuid references products(id) on delete cascade,
  fabric_id uuid references fabrics(id) on delete cascade,
  primary key (product_id, fabric_id)
);

-- Colour catalogue
create table colours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex text not null,
  pantone text,
  moq_override int,
  available boolean default true,
  sort_order int default 0
);

-- Which colours are available for which products
create table product_colours (
  product_id uuid references products(id) on delete cascade,
  colour_id uuid references colours(id) on delete cascade,
  image_url text,
  primary key (product_id, colour_id)
);

-- Decoration techniques
create table techniques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_add_50 numeric(8,2) default 0,
  price_add_100 numeric(8,2) default 0,
  price_add_500 numeric(8,2) default 0,
  available boolean default true,
  sort_order int default 0
);

-- Decoration placement zones per product
create table placement_zones (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  x_pct numeric(5,2),
  y_pct numeric(5,2),
  w_pct numeric(5,2),
  h_pct numeric(5,2)
);

-- Pricing tiers per product
create table pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  quantity int not null,
  base_price_gbp numeric(8,2) not null
);

-- Quote submissions
create table quotes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  fabric_id uuid references fabrics(id),
  colour_id uuid references colours(id),
  technique_id uuid references techniques(id),
  placement_zone_id uuid references placement_zones(id),
  quantity int not null,
  size_breakdown jsonb,
  estimated_unit_price numeric(8,2),
  estimated_total numeric(8,2),
  logo_file_url text,
  additional_notes text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Quote reference sequence
create sequence quote_seq start 1;

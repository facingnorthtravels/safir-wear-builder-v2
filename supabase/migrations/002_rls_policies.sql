-- Allow anonymous reads on all public catalogue tables
-- quotes remain restricted (no anon read policy)

alter table products enable row level security;
alter table product_variants enable row level security;
alter table fabrics enable row level security;
alter table product_fabrics enable row level security;
alter table colours enable row level security;
alter table product_colours enable row level security;
alter table techniques enable row level security;
alter table placement_zones enable row level security;
alter table pricing_tiers enable row level security;

create policy "public read products"
  on products for select to anon using (true);

create policy "public read product_variants"
  on product_variants for select to anon using (true);

create policy "public read fabrics"
  on fabrics for select to anon using (true);

create policy "public read product_fabrics"
  on product_fabrics for select to anon using (true);

create policy "public read colours"
  on colours for select to anon using (true);

create policy "public read product_colours"
  on product_colours for select to anon using (true);

create policy "public read techniques"
  on techniques for select to anon using (true);

create policy "public read placement_zones"
  on placement_zones for select to anon using (true);

create policy "public read pricing_tiers"
  on pricing_tiers for select to anon using (true);

-- quotes: anon can insert (submit a quote), but not read
alter table quotes enable row level security;

create policy "anon insert quotes"
  on quotes for insert to anon with check (true);

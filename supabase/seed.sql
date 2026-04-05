-- Products
insert into products (slug, name, category, description, sort_order) values
('tee-regular', 'T-Shirt', 'tops', 'Classic regular fit tee. 80% cotton, 20% polyester.', 1),
('tee-oversized', 'Oversized T-Shirt', 'tops', 'Boxy oversized fit. 280+ GSM for substantial weight.', 2),
('hoodie', 'Hoodie', 'tops', 'Oversized fit hoodie with kangaroo pocket. 380–400 GSM.', 3),
('sweatshirt-crew', 'Crew Neck Sweatshirt', 'tops', 'Relaxed fit crew neck. 360–380 GSM fleece or terry.', 4),
('sweatshirt-quarter', 'Quarter-Zip Sweatshirt', 'tops', 'Mock neck quarter-zip. 360–380 GSM. Navy.', 5),
('jogger', 'Straight Jogger', 'bottoms', 'Straight fit jogger with elasticated waistband. 360–380 GSM.', 6),
('jacket-twill', 'Twill Jacket', 'outerwear', 'Structured twill jacket. Available in black or khaki.', 7),
('tote-bag', 'Tote Bag', 'accessories', 'Thick canvas 340–360 GSM with webbing handle.', 8),
('cap', 'Cap', 'accessories', 'Branded cap with embroidered logo and buckle adjustment.', 9);

-- Variants
insert into product_variants (product_id, name)
select id, 'Regular Fit' from products where slug = 'tee-regular';
insert into product_variants (product_id, name)
select id, 'Oversized / Boxy' from products where slug = 'tee-oversized';
insert into product_variants (product_id, name)
select id, 'Oversized' from products where slug = 'hoodie';
insert into product_variants (product_id, name)
select id, 'Relaxed Fit' from products where slug = 'sweatshirt-crew';
insert into product_variants (product_id, name)
select id, 'Relaxed Fit' from products where slug = 'sweatshirt-quarter';
insert into product_variants (product_id, name)
select id, 'Straight Fit' from products where slug = 'jogger';

-- Fabrics
insert into fabrics (name, composition, gsm_min, gsm_max, gsm_default, description) values
('Cotton Jersey', '80% Cotton, 20% Polyester', 160, 220, 190, 'Lightweight and breathable. Ideal for tees.'),
('Cotton Fleece', '80% Cotton, 20% Polyester', 300, 400, 360, 'Soft and substantial. Hoodies and sweatshirts.'),
('Terry Fleece', '80% Cotton, 20% Polyester', 300, 380, 360, 'French terry texture. Great for crew necks.'),
('Canvas', '100% Cotton', 340, 360, 350, 'Thick and durable. For tote bags.');

-- Product-fabric compatibility
insert into product_fabrics (product_id, fabric_id)
select p.id, f.id from products p, fabrics f
where p.slug in ('tee-regular','tee-oversized') and f.name = 'Cotton Jersey';
insert into product_fabrics (product_id, fabric_id)
select p.id, f.id from products p, fabrics f
where p.slug in ('hoodie','sweatshirt-crew','sweatshirt-quarter','jogger') and f.name = 'Cotton Fleece';
insert into product_fabrics (product_id, fabric_id)
select p.id, f.id from products p, fabrics f
where p.slug in ('sweatshirt-crew','sweatshirt-quarter','jogger') and f.name = 'Terry Fleece';
insert into product_fabrics (product_id, fabric_id)
select p.id, f.id from products p, fabrics f
where p.slug = 'tote-bag' and f.name = 'Canvas';

-- Colours
insert into colours (name, hex, pantone, sort_order) values
('Jet Black', '#1a1a1a', 'Black C', 1),
('Stone', '#f0ebe3', 'Warm Gray 1 C', 2),
('Navy', '#1e2a4a', '289 C', 3),
('Chocolate', '#3d2b1f', '4625 C', 4),
('Charcoal', '#3a3a3a', '432 C', 5),
('Rust', '#7a3b2e', '1685 C', 6),
('Khaki', '#8b7355', '4515 C', 7),
('Forest Green', '#2d4a3e', '350 C', 8),
('Burgundy', '#5c1a2a', '209 C', 9),
('Cream', '#faf6f0', 'Cloud Dancer', 10);

-- Make all colours available for all products
insert into product_colours (product_id, colour_id)
select p.id, c.id from products p cross join colours c;

-- Techniques
insert into techniques (name, description, price_add_50, price_add_100, price_add_500, sort_order) values
('Machine Embroidery', 'Classic raised thread embroidery. Up to 10,000 stitches.', 0, 0, 0, 1),
('Screen Print (1 colour)', 'Flat ink print. Sharp edges, great for bold logos.', 0.50, 0.50, 0.50, 2),
('3D Puff Embroidery', 'Raised foam under embroidery for a bold 3D effect.', 1.50, 1.50, 1.50, 3),
('Block Print', 'Hand-applied block printing. Unique texture and character.', 1.00, 1.00, 1.00, 4),
('Puff Paste Screen Print', 'Screen print with raised puff texture.', 1.20, 1.20, 1.20, 5),
('Tonal Embroidery', 'Embroidery in the same colour as the garment. Subtle and premium.', 0.80, 0.80, 0.80, 6);

-- Pricing tiers
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 8.00 from products where slug = 'tee-regular';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 7.00 from products where slug = 'tee-regular';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 6.00 from products where slug = 'tee-regular';

insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 9.00 from products where slug = 'tee-oversized';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 8.00 from products where slug = 'tee-oversized';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 7.00 from products where slug = 'tee-oversized';

insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 17.00 from products where slug = 'hoodie';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 16.00 from products where slug = 'hoodie';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 14.00 from products where slug = 'hoodie';

insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 15.00 from products where slug = 'sweatshirt-crew';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 14.00 from products where slug = 'sweatshirt-crew';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 12.00 from products where slug = 'sweatshirt-crew';

insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 16.00 from products where slug = 'sweatshirt-quarter';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 15.00 from products where slug = 'sweatshirt-quarter';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 13.00 from products where slug = 'sweatshirt-quarter';

insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 50, 8.00 from products where slug = 'tote-bag';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 100, 7.00 from products where slug = 'tote-bag';
insert into pricing_tiers (product_id, quantity, base_price_gbp)
select id, 500, 6.00 from products where slug = 'tote-bag';

-- Placement zones for hoodie (as example)
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Left Chest', 28.0, 38.0, 20.0, 18.0 from products where slug = 'hoodie';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Centre Chest', 38.0, 38.0, 24.0, 22.0 from products where slug = 'hoodie';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Centre Back', 38.0, 30.0, 24.0, 30.0 from products where slug = 'hoodie';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Left Sleeve', 15.0, 48.0, 14.0, 12.0 from products where slug = 'hoodie';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Hem', 25.0, 82.0, 50.0, 8.0 from products where slug = 'hoodie';

-- Repeat placement zones for tee-regular
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Left Chest', 28.0, 35.0, 20.0, 18.0 from products where slug = 'tee-regular';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Centre Chest', 38.0, 35.0, 24.0, 22.0 from products where slug = 'tee-regular';
insert into placement_zones (product_id, name, x_pct, y_pct, w_pct, h_pct)
select id, 'Centre Back', 38.0, 28.0, 24.0, 30.0 from products where slug = 'tee-regular';

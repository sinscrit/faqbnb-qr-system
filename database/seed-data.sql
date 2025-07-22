-- Sample data for QR Item Display System
-- Run this after creating the schema

-- NOTE: Admin user creation requires manual setup in Supabase Auth Dashboard
-- After creating a user with email admin@faqbnb.com in Supabase Auth,
-- get the UUID and insert into admin_users table manually:
-- INSERT INTO admin_users (id, email, full_name, role) VALUES 
-- ('<uuid-from-auth-users>', 'admin@faqbnb.com', 'Admin User', 'admin');

-- Insert sample items
INSERT INTO items (public_id, name, description, qr_code_url, qr_code_uploaded_at) VALUES
('12345', 'Samsung WF45T6000AW Washing Machine', 'Front-loading washing machine with steam cleaning and smart features. Located in the laundry room next to the dryer.', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://faqbnb.com/item/12345', NOW()),
('tv-001', 'Samsung 65" QLED Smart TV', 'Living room smart TV with 4K resolution and streaming capabilities. Includes voice remote and smart home integration.', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://faqbnb.com/item/tv-001', NOW()),
('coffee-maker', 'Keurig K-Elite Coffee Maker', 'Single-serve coffee maker in the kitchen. Supports K-Cup pods and has programmable settings for different cup sizes.', NULL, NULL),
('thermostat', 'Nest Learning Thermostat', 'Smart thermostat that learns your schedule and preferences. Controls heating and cooling throughout the house.', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://faqbnb.com/item/thermostat', NOW()),
('dishwasher', 'Bosch 800 Series Dishwasher', 'Quiet dishwasher with multiple wash cycles. Located under the kitchen counter next to the sink.', NULL, NULL);

-- Get item IDs for linking (using CTEs for cleaner queries)
WITH item_ids AS (
  SELECT id, public_id FROM items
)

-- Insert sample links for washing machine (12345)
INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order)
SELECT 
  (SELECT id FROM item_ids WHERE public_id = '12345'),
  'How to Start a Load',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  1
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = '12345'),
  'User Manual',
  'pdf',
  'https://www.samsung.com/us/support/owners/product/front-load-washer-wf45t6000aw',
  'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/washing-machine-manual-thumb.jpg',
  2
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = '12345'),
  'Detergent Compartments Guide',
  'image',
  'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/washing-machine-detergent-guide.jpg',
  NULL,
  3
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = '12345'),
  'Troubleshooting Guide',
  'text',
  'https://www.samsung.com/us/support/troubleshooting/TSG01203568/',
  'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/support-icon.png',
  4;

-- Insert sample links for Smart TV (tv-001)
INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order)
SELECT 
  (SELECT id FROM item_ids WHERE public_id = 'tv-001'),
  'Setting Up Smart Features',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  1
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'tv-001'),
  'Remote Control Guide',
  'pdf',
  'https://www.samsung.com/us/support/owners/product/qled-tv-qn65q70t',
  'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/tv-remote-guide-thumb.jpg',
  2
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'tv-001'),
  'Streaming Apps Setup',
  'text',
  'https://www.samsung.com/us/support/answer/ANS00062648/',
  'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/streaming-icon.png',
  3;

-- Insert sample links for Coffee Maker (coffee-maker)
INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order)
SELECT 
  (SELECT id FROM item_ids WHERE public_id = 'coffee-maker'),
  'How to Brew Perfect Coffee',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  1
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'coffee-maker'),
  'Cleaning and Maintenance',
  'pdf',
  'https://www.keurig.com/support/k-elite-coffee-maker',
  'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw123456/images/support/maintenance-guide-thumb.jpg',
  2
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'coffee-maker'),
  'Troubleshooting Common Issues',
  'text',
  'https://www.keurig.com/support/troubleshooting',
  'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw789012/images/support/troubleshoot-icon.png',
  3;

-- Insert sample links for Thermostat (thermostat)
INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order)
SELECT 
  (SELECT id FROM item_ids WHERE public_id = 'thermostat'),
  'Initial Setup Guide',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  1
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'thermostat'),
  'Programming Your Schedule',
  'text',
  'https://support.google.com/googlenest/answer/9247296',
  'https://lh3.googleusercontent.com/support/schedule-icon.png',
  2
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'thermostat'),
  'Energy Saving Tips',
  'pdf',
  'https://support.google.com/googlenest/answer/9247296',
  'https://lh3.googleusercontent.com/support/energy-tips-thumb.jpg',
  3;

-- Insert sample links for Dishwasher (dishwasher)
INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order)
SELECT 
  (SELECT id FROM item_ids WHERE public_id = 'dishwasher'),
  'Loading Your Dishwasher',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  1
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'dishwasher'),
  'Cycle Selection Guide',
  'image',
  'https://www.bosch-home.com/us/support/dishwasher-cycle-guide.jpg',
  NULL,
  2
UNION ALL SELECT
  (SELECT id FROM item_ids WHERE public_id = 'dishwasher'),
  'User Manual',
  'pdf',
  'https://www.bosch-home.com/us/support/owners/product/dishwasher-800-series',
  'https://www.bosch-home.com/images/support/manual-thumb.jpg',
  3;


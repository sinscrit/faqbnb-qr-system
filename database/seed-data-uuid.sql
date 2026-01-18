-- Sample data for QR Item Display System (UUID version)
-- Run this after creating the schema
-- This version uses random UUIDs for public_id instead of readable strings

-- Insert sample items with UUID public IDs
DO $$
DECLARE
    washing_machine_uuid text := gen_random_uuid()::text;
    tv_uuid text := gen_random_uuid()::text;
    coffee_maker_uuid text := gen_random_uuid()::text;
    thermostat_uuid text := gen_random_uuid()::text;
    dishwasher_uuid text := gen_random_uuid()::text;
    washing_machine_id uuid;
    tv_id uuid;
    coffee_maker_id uuid;
    thermostat_id uuid;
    dishwasher_id uuid;
BEGIN
    -- Insert items and get their IDs
    INSERT INTO items (public_id, name, description) VALUES
    (washing_machine_uuid, 'Samsung WF45T6000AW Washing Machine', 'Front-loading washing machine with steam cleaning and smart features. Located in the laundry room next to the dryer.')
    RETURNING id INTO washing_machine_id;
    
    INSERT INTO items (public_id, name, description) VALUES
    (tv_uuid, 'Samsung 65" QLED Smart TV', 'Living room smart TV with 4K resolution and streaming capabilities. Includes voice remote and smart home integration.')
    RETURNING id INTO tv_id;
    
    INSERT INTO items (public_id, name, description) VALUES
    (coffee_maker_uuid, 'Keurig K-Elite Coffee Maker', 'Single-serve coffee maker in the kitchen. Supports K-Cup pods and has programmable settings for different cup sizes.')
    RETURNING id INTO coffee_maker_id;
    
    INSERT INTO items (public_id, name, description) VALUES
    (thermostat_uuid, 'Nest Learning Thermostat', 'Smart thermostat that learns your schedule and preferences. Controls heating and cooling throughout the house.')
    RETURNING id INTO thermostat_id;
    
    INSERT INTO items (public_id, name, description) VALUES
    (dishwasher_uuid, 'Bosch 800 Series Dishwasher', 'Quiet dishwasher with multiple wash cycles. Located under the kitchen counter next to the sink.')
    RETURNING id INTO dishwasher_id;

    -- Insert links for washing machine
    INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order) VALUES
    (washing_machine_id, 'How to Start a Load', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1),
    (washing_machine_id, 'User Manual', 'pdf', 'https://www.samsung.com/us/support/owners/product/front-load-washer-wf45t6000aw', 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/washing-machine-manual-thumb.jpg', 2),
    (washing_machine_id, 'Detergent Compartments Guide', 'image', 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/washing-machine-detergent-guide.jpg', NULL, 3),
    (washing_machine_id, 'Troubleshooting Guide', 'text', 'https://www.samsung.com/us/support/troubleshooting/TSG01203568/', 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/support-icon.png', 4);

    -- Insert links for Smart TV
    INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order) VALUES
    (tv_id, 'Setting Up Smart Features', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1),
    (tv_id, 'Remote Control Guide', 'pdf', 'https://www.samsung.com/us/support/owners/product/qled-tv-qn65q70t', 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/tv-remote-guide-thumb.jpg', 2),
    (tv_id, 'Streaming Apps Setup', 'text', 'https://www.samsung.com/us/support/answer/ANS00062648/', 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/streaming-icon.png', 3);

    -- Insert links for Coffee Maker
    INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order) VALUES
    (coffee_maker_id, 'How to Brew Perfect Coffee', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1),
    (coffee_maker_id, 'Cleaning and Maintenance', 'pdf', 'https://www.keurig.com/support/k-elite-coffee-maker', 'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw123456/images/support/maintenance-guide-thumb.jpg', 2),
    (coffee_maker_id, 'Troubleshooting Common Issues', 'text', 'https://www.keurig.com/support/troubleshooting', 'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw789012/images/support/troubleshoot-icon.png', 3);

    -- Insert links for Thermostat
    INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order) VALUES
    (thermostat_id, 'Initial Setup Guide', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1),
    (thermostat_id, 'Programming Your Schedule', 'text', 'https://support.google.com/googlenest/answer/9247296', 'https://lh3.googleusercontent.com/support/schedule-icon.png', 2),
    (thermostat_id, 'Energy Saving Tips', 'pdf', 'https://support.google.com/googlenest/answer/9247296', 'https://lh3.googleusercontent.com/support/energy-tips-thumb.jpg', 3);

    -- Insert links for Dishwasher
    INSERT INTO item_links (item_id, title, link_type, url, thumbnail_url, display_order) VALUES
    (dishwasher_id, 'Loading Your Dishwasher', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1),
    (dishwasher_id, 'Cycle Selection Guide', 'image', 'https://www.bosch-home.com/us/support/dishwasher-cycle-guide.jpg', NULL, 2),
    (dishwasher_id, 'User Manual', 'pdf', 'https://www.bosch-home.com/us/support/owners/product/dishwasher-800-series', 'https://www.bosch-home.com/images/support/manual-thumb.jpg', 3);

    -- Output the generated UUIDs for reference
    RAISE NOTICE 'Generated UUIDs:';
    RAISE NOTICE 'Washing Machine: %', washing_machine_uuid;
    RAISE NOTICE 'TV: %', tv_uuid;
    RAISE NOTICE 'Coffee Maker: %', coffee_maker_uuid;
    RAISE NOTICE 'Thermostat: %', thermostat_uuid;
    RAISE NOTICE 'Dishwasher: %', dishwasher_uuid;
END $$; 
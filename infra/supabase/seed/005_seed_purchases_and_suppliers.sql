-- Seed suppliers, purchase batches, and purchase items
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Create Suppliers
    INSERT INTO user_suppliers (user_id, name, contact_email)
    VALUES
        (user_uuid, 'ElectroTech Distributors', 'sales@electrotech.com'),
        (user_uuid, 'Gadget World Inc.', 'info@gadgetworld.com'),
        (user_uuid, 'Global Gadget Suppliers', 'support@globalgadgets.com'),
        (user_uuid, 'Premium Electronics Co.', 'contact@premiumelectronics.com');

    -- Create Purchase Batches
    INSERT INTO user_purchase_batches (user_id, supplier_id, name)
    VALUES
        (user_uuid, (SELECT id FROM user_suppliers WHERE name = 'ElectroTech Distributors'), 'Q1 2024 Audio Batch'),
        (user_uuid, (SELECT id FROM user_suppliers WHERE name = 'Global Gadget Suppliers'), 'Spring 2024 Electronics Batch'),
        (user_uuid, (SELECT id FROM user_suppliers WHERE name = 'Gadget World Inc.'), '2024 Smart Home Collection'),
        (user_uuid, (SELECT id FROM user_suppliers WHERE name = 'Premium Electronics Co.'), 'Q1 2024 Miscellaneous Electronics');

    -- Link Items to Batches with COGS
    INSERT INTO user_purchase_items (user_id, batch_id, item_id, quantity, unit_cost)
    VALUES
        (user_uuid, (SELECT id FROM user_purchase_batches WHERE name = 'Q1 2024 Audio Batch'), (SELECT id FROM user_inventory_items WHERE name = 'Wireless Bluetooth Earbuds'), 500, 35.00),
        (user_uuid, (SELECT id FROM user_purchase_batches WHERE name = 'Spring 2024 Electronics Batch'), (SELECT id FROM user_inventory_items WHERE name = 'Smartphone Charging Dock'), 300, 12.50),
        (user_uuid, (SELECT id FROM user_purchase_batches WHERE name = '2024 Smart Home Collection'), (SELECT id FROM user_inventory_items WHERE name = 'Smart WiFi Security Camera'), 150, 45.00),
        (user_uuid, (SELECT id FROM user_purchase_batches WHERE name = 'Spring 2024 Electronics Batch'), (SELECT id FROM user_inventory_items WHERE name = 'Premium Phone Case'), 1000, 8.00),
        (user_uuid, (SELECT id FROM user_purchase_batches WHERE name = 'Q1 2024 Miscellaneous Electronics'), (SELECT id FROM user_inventory_items WHERE name = 'Wireless Keyboard & Mouse Combo'), 200, 22.00);
END $$;

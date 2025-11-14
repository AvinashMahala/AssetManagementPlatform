-- Seed data for expenses
-- Insert sample expense data for testing and demonstration

-- Note: This assumes you have properties, units, and users already seeded
-- The property_id, unit_id, and user IDs should be replaced with actual values from your database

-- Clear existing expenses (optional - only for fresh setup)
-- TRUNCATE TABLE expenses CASCADE;

-- Sample recurring expenses for a property
-- WiFi/Internet expense (monthly, split among tenants)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1), -- Replace with actual property ID
    NULL,
    'wifi_internet',
    'Monthly WiFi and Internet service for the property',
    2500.00,
    'monthly',
    '2024-01-01',
    'split_among_tenants',
    'active',
    (SELECT id FROM users LIMIT 1) -- Replace with actual user ID
)
ON CONFLICT (id) DO NOTHING;

-- Water bill (monthly, owner only)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'water_bill',
    'Monthly water bill for the entire property',
    1800.00,
    'monthly',
    '2024-01-01',
    'owner_only',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Cleaning service (monthly, split among tenants)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'cleaning',
    'Professional cleaning service for common areas',
    3200.00,
    'monthly',
    '2024-01-01',
    'split_among_tenants',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Electricity bill (monthly, split among tenants)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'electrical_work',
    'Monthly electricity bill for common areas',
    4500.00,
    'monthly',
    '2024-01-01',
    'split_among_tenants',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Plumbing repair (one-time, specific unit)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    (SELECT id FROM units LIMIT 1), -- Replace with actual unit ID
    'plumbing',
    'Emergency plumbing repair for bathroom sink',
    8500.00,
    'one_time',
    '2024-11-15',
    'specific_units',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- AC repair (one-time, owner only)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'ac_repair',
    'AC unit repair and maintenance',
    12500.00,
    'one_time',
    '2024-11-10',
    'owner_only',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Housekeeping supplies (quarterly, split among tenants)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'housekeeping',
    'Cleaning supplies and housekeeping materials',
    2800.00,
    'quarterly',
    '2024-01-01',
    'split_among_tenants',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Security system maintenance (yearly, owner only)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'surveillance_cameras',
    'Annual maintenance for security cameras and alarm system',
    15000.00,
    'yearly',
    '2024-01-01',
    'owner_only',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Cable/Dish service (monthly, split among tenants)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    NULL,
    'cable_dish',
    'Cable TV and dish service subscription',
    1800.00,
    'monthly',
    '2024-01-01',
    'split_among_tenants',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Furniture repair (one-time, specific unit)
INSERT INTO expenses (property_id, unit_id, type, description, amount, frequency, start_date, distribution, status, created_by) VALUES
(
    (SELECT id FROM properties LIMIT 1),
    (SELECT id FROM units LIMIT 1 OFFSET 1), -- Replace with actual unit ID
    'furniture_repair',
    'Repair of bedroom furniture and mattress',
    6500.00,
    'one_time',
    '2024-11-08',
    'specific_units',
    'active',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Display inserted expenses
SELECT
    e.id,
    p.name as property_name,
    u.unit_number,
    e.expense_type,
    e.description,
    e.amount,
    e.frequency,
    e.distribution_method,
    e.status,
    e.expense_date
FROM expenses e
LEFT JOIN properties p ON e.property_id = p.id
LEFT JOIN units u ON e.unit_id = u.id
ORDER BY e.created_at DESC;
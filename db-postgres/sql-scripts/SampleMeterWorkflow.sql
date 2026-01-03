INSERT INTO utility_types (key, name, unit_of_measure) VALUES ('electricity','Electricity','kWh') RETURNING id;

INSERT INTO utility_types (key, name, unit_of_measure) VALUES ('water','water','kWh') RETURNING id;

INSERT INTO utility_subscriptions (unit_id, utility_type_id, subscription_name, billing_method, billing_multiplier)
VALUES ('5f9cd161-3bed-46fa-8953-efc13d35f394', '3fb698a2-4c3c-4f8c-83ef-39a3510823ed', 'Unit 101 Electricity', 'meter_allocated', 1.0) RETURNING id;


INSERT INTO meters (property_id, unit_id, meter_number, device_multiplier, meter_name, meter_type)
VALUES ('8880cd79-05c4-4545-bc42-c8acb34999e1','5f9cd161-3bed-46fa-8953-efc13d35f394','MTR-1001',1.0,'Main Elec Meter','electric') RETURNING id;


INSERT INTO tariffs (utility_type_id, rate_per_unit, fixed_charge, effective_from, name)
VALUES ('3fb698a2-4c3c-4f8c-83ef-39a3510823ed', 0.25, 0.0, CURRENT_DATE, 'Default elec rate') RETURNING id;


INSERT INTO meter_allocations (meter_id, subscription_id, allocation_fraction)
VALUES ('d4175f6e-f5a5-45e9-8f9d-ea2da66b1e51','5ef35f58-d46a-4b4d-b0f7-1598041860f4', 1.0) RETURNING id;



select * from meters;

select * from utility_subscriptions us ;

select * from users; -- 0075ac4c-399e-4267-ad35-0b188cfd4cee	admin

048f9ee9-aa7a-429e-8189-95a6e31f5846
select * from tenants;
select * from leases; 17cbf82a-f47b-4df8-970e-3b9f13a0d3f3	8880cd79-05c4-4545-bc42-c8acb34999e1	5f9cd161-3bed-46fa-8953-efc13d35f394	048f9ee9-aa7a-429e-8189-95a6e31f5846





select * from rent_transactions rt ;
-- Migration for Campus Eats Order Updates
-- Run this in your Supabase SQL Editor

-- 1. Add order_number for short IDs
ALTER TABLE campuseats_orders 
ADD COLUMN IF NOT EXISTS order_number SERIAL;

-- 2. Add reassignment column for smart cancellation
ALTER TABLE campuseats_orders 
ADD COLUMN IF NOT EXISTS reassigned_to_order_id UUID REFERENCES campuseats_orders(id);

-- 3. Ensure RLS allows reading these new columns (usually automatic, but good to check)
-- No generic 'ALL' policy change needed if SELECT policies use *

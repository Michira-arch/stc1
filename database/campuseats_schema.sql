-- =============================================
-- CampusEats Schema
-- Restaurant, Menu, and Order Management
-- =============================================

-- Restaurants Table
CREATE TABLE IF NOT EXISTS campuseats_restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    delivery_time TEXT DEFAULT '20-30 min',
    rating DECIMAL(3, 1) DEFAULT 0.0,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS campuseats_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES campuseats_restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Stored in KES (no cents usually needed, or use minor units)
    image_url TEXT,
    category TEXT NOT NULL, -- e.g. 'Burgers', 'Drinks'
    is_available BOOLEAN DEFAULT TRUE,
    calories INTEGER,
    tags TEXT[], -- Array of tags like 'spicy', 'vegan'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS campuseats_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES campuseats_restaurants(id) ON DELETE SET NULL,
    total_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending',
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS campuseats_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES campuseats_orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES campuseats_menu_items(id) ON DELETE SET NULL,
    menu_item_name TEXT, -- Snapshot in case item is deleted
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time INTEGER NOT NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS campuseats_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES campuseats_restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campuseats_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuseats_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuseats_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuseats_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuseats_reviews ENABLE ROW LEVEL SECURITY;

-- Policies

-- Restaurants: Everyone can view active
CREATE POLICY "campuseats_restaurants_select" ON campuseats_restaurants
    FOR SELECT USING (is_active = true OR auth.uid() = owner_id);

-- Restaurants: Authenticated users can create (register)
CREATE POLICY "campuseats_restaurants_insert" ON campuseats_restaurants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Restaurants: Owners can update
CREATE POLICY "campuseats_restaurants_update" ON campuseats_restaurants
    FOR UPDATE USING (auth.uid() = owner_id);

-- Menu Items: Everyone can view available
CREATE POLICY "campuseats_menu_items_select" ON campuseats_menu_items
    FOR SELECT USING (is_available = true OR EXISTS (
        SELECT 1 FROM campuseats_restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    ));

-- Menu Items: Owners can insert/update/delete
CREATE POLICY "campuseats_menu_items_all" ON campuseats_menu_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM campuseats_restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    ));

-- Orders: Users can view their own, Restaurants can view their orders
CREATE POLICY "campuseats_orders_select" ON campuseats_orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM campuseats_restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    );

-- Orders: Authenticated users can create
CREATE POLICY "campuseats_orders_insert" ON campuseats_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders: Owners and Users can update (e.g. cancel, update status)
CREATE POLICY "campuseats_orders_update" ON campuseats_orders
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM campuseats_restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    );

-- Order Items: Viewable if Order is viewable
CREATE POLICY "campuseats_order_items_select" ON campuseats_order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM campuseats_orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM campuseats_restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())))
    );

-- Order Items: Insertable if Order is insertable (simplification)
CREATE POLICY "campuseats_order_items_insert" ON campuseats_order_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM campuseats_orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    );


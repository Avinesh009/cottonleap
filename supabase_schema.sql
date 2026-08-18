-- Supabase DDL Schema & Seed Script for CottonLeap
-- Execute this script in your Supabase SQL Editor to initialize the database tables and seed them with default data.

-- 1. CLEANUP (Optional - Uncomment if recreating tables)
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS blog_posts CASCADE;
-- DROP TABLE IF EXISTS esg_metrics CASCADE;
-- DROP TABLE IF EXISTS production_steps CASCADE;
-- DROP TABLE IF EXISTS user_orders CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'vendor', 'production_manager', 'quality_control', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    style TEXT,
    quantity TEXT,
    progress INTEGER DEFAULT 0,
    weeks TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Orders many-to-many relationship mapping table
CREATE TABLE IF NOT EXISTS user_orders (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(order_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, order_id)
);

-- Production Steps table
CREATE TABLE IF NOT EXISTS production_steps (
    order_id TEXT REFERENCES orders(order_id) ON DELETE CASCADE,
    step_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'in-progress', 'pending')),
    week TEXT DEFAULT '',
    date TEXT DEFAULT '',
    icon TEXT DEFAULT 'Circle',
    detail TEXT DEFAULT '',
    schedule TEXT DEFAULT '',
    week_data JSONB DEFAULT '{}'::JSONB,
    PRIMARY KEY (order_id, step_id)
);

-- ESG Metrics table (1-to-1 relationship with orders)
CREATE TABLE IF NOT EXISTS esg_metrics (
    order_id TEXT PRIMARY KEY REFERENCES orders(order_id) ON DELETE CASCADE,
    organic_fiber INTEGER DEFAULT 0,
    carbon_offset INTEGER DEFAULT 0,
    water_recycling INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Uncategorized',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UPDATED_AT TRIGGER AUTOMATION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_esg_metrics_updated_at
    BEFORE UPDATE ON esg_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. SEED INITIAL DATA

-- Seed Users
INSERT INTO users (id, name, email, password, company, role) VALUES
('super_admin', 'Super Admin', 'admin@cottonleap.com', 'admin123', 'Cottonleap', 'super_admin'),
('user1', 'Alice Chen', 'alice@maisonelevee.com', 'password123', 'Maison Élevée', 'client'),
('user2', 'Marcus Schmidt', 'marcus@atelier.com', 'password123', 'Atelier Berlin', 'client'),
('user3', 'Sarah Johnson', 'sarah@cottonleap.com', 'password123', 'Cottonleap', 'production_manager'),
('user4', 'Priya Patel', 'priya@ecofabrics.com', 'password123', 'EcoFabrics Ltd', 'vendor')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    company = EXCLUDED.company,
    role = EXCLUDED.role;

-- Seed Orders
INSERT INTO orders (order_id, name, client, style, quantity, progress, weeks) VALUES
('cotton-robin', 'Cotton Robin', 'Maison Élevée', 'Organic Cotton Collection', '2,400 units', 45, ARRAY[
  'Week 1 (April 27 - May 2)', 
  'Week 2 (May 4-May 9)', 
  'Week 3 (May 11-May 16)', 
  'Week 4 (May 18-23)', 
  'Week 5 (May25-May 30)', 
  'Week 6 (June 1-June 5)', 
  'Week 7 (June 7-June 12)', 
  'Week 8 (June 14-June 18)', 
  'Week 8 (June 19)'
]),
('little-cherries', 'Little Cherries', 'Maison Élevée', 'Cotton Kids Collection', '1,800 units', 25, ARRAY[
  'Week 1 (May 04 - May 09)', 
  'Week 2 (May 11-May 16)', 
  'Week 3 (May 18-May 23)', 
  'Week 4 (May 25-30)', 
  'Week 5 (June 01-June 06)', 
  'Week 6 (June 08-June 13)', 
  'Week 7 (June 15-June 20)', 
  'Week 8 (June 22-June 25)', 
  'Week 8 (June 26-June27)'
]),
('gubbachi', 'Gubbachi', 'Atelier Berlin', 'Wool Collection', '1,800 units', 30, ARRAY[
  'Week 1 (May 25 - May 31)', 
  'Week 2 (June 1-June 7)', 
  'Week 3 (June 8- June 14)', 
  'Week 4 (June 15- June 21)', 
  'Week 5 (June 22-June 28)', 
  'Week 6 (June 29-July 5)', 
  'Week 7 (July 6-July 12)', 
  'Week 8 (July 13-July 19)'
]),
('lil-sistas', 'Lil Sistas', 'Atelier Berlin', 'Kids Wool Collection', '1,200 units', 15, ARRAY[
  'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9'
])
ON CONFLICT (order_id) DO UPDATE SET
    name = EXCLUDED.name,
    client = EXCLUDED.client,
    style = EXCLUDED.style,
    quantity = EXCLUDED.quantity,
    progress = EXCLUDED.progress,
    weeks = EXCLUDED.weeks;

-- Seed User-Orders relations
DELETE FROM user_orders;
INSERT INTO user_orders (user_id, order_id) VALUES
('super_admin', 'cotton-robin'),
('super_admin', 'little-cherries'),
('super_admin', 'gubbachi'),
('super_admin', 'lil-sistas'),
('user1', 'cotton-robin'),
('user1', 'little-cherries'),
('user2', 'gubbachi'),
('user2', 'lil-sistas'),
('user3', 'cotton-robin'),
('user3', 'little-cherries'),
('user3', 'gubbachi'),
('user3', 'lil-sistas'),
('user4', 'cotton-robin');

-- Seed Production Steps for 'cotton-robin'
INSERT INTO production_steps (order_id, step_id, label, status, week, date, icon, detail, schedule, week_data) VALUES
('cotton-robin', 1, 'Yarns', 'completed', 'Week 1 (April 27 - May 2)', 'May 2', 'Package', 'Yarns sourced and ready for knitting.', 'Week 1', '{"0": true}'),
('cotton-robin', 2, 'Knitting', 'completed', 'Week 2 (May 4-May 9)', 'May 9', 'Scissors', 'Knitting completed on schedule.', 'Week 2', '{"1": true}'),
('cotton-robin', 3, 'Heat Setting', 'in-progress', 'Week 3 (May 11-May 16)', 'May 16', 'Clock', 'Heat setting in progress.', 'Week 3', '{"2": true}'),
('cotton-robin', 4, 'Dyeing', 'pending', '', 'May 23', 'Circle', 'Dyeing scheduled.', '', '{}'),
('cotton-robin', 5, 'Compacting', 'pending', '', 'May 30', 'Circle', 'Compacting scheduled.', '', '{}'),
('cotton-robin', 6, 'Printing', 'pending', '', 'Jun 5', 'Circle', 'Printing scheduled.', '', '{}'),
('cotton-robin', 7, 'Curing/Finishing', 'pending', '', 'Jun 12', 'Circle', 'Curing scheduled.', '', '{}'),
('cotton-robin', 8, 'Pattern Making', 'pending', '', 'Jun 18', 'Circle', 'Pattern making scheduled.', '', '{}'),
('cotton-robin', 9, 'Sewing', 'pending', '', 'Jun 19', 'Circle', 'Sewing scheduled.', '', '{}'),
('cotton-robin', 10, 'Quality Inspection', 'pending', '', 'Jun 19', 'Circle', 'Quality inspection scheduled.', '', '{}'),
('cotton-robin', 11, 'Shipping', 'pending', '', 'Jun 19', 'Circle', 'Shipping scheduled.', '', '{}')
ON CONFLICT (order_id, step_id) DO UPDATE SET
    label = EXCLUDED.label, status = EXCLUDED.status, week = EXCLUDED.week, date = EXCLUDED.date,
    icon = EXCLUDED.icon, detail = EXCLUDED.detail, schedule = EXCLUDED.schedule, week_data = EXCLUDED.week_data;

-- Seed Production Steps for 'little-cherries'
INSERT INTO production_steps (order_id, step_id, label, status, week, date, icon, detail, schedule, week_data) VALUES
('little-cherries', 1, 'Fibre & Yarns', 'completed', 'Week 1 (May 04 - May 09)', 'May 9', 'Package', 'Fibre and yarns sourced.', 'Week 1', '{"0": true}'),
('little-cherries', 2, 'Knitting', 'in-progress', 'Week 2 (May 11-May 16)', 'May 16', 'Clock', 'Knitting in progress.', 'Week 2', '{"1": true}'),
('little-cherries', 3, 'Heat Setting', 'pending', '', 'May 23', 'Circle', 'Heat setting scheduled.', '', '{}'),
('little-cherries', 4, 'Dyeing', 'pending', '', 'May 30', 'Circle', 'Dyeing scheduled.', '', '{}'),
('little-cherries', 5, 'Compacting', 'pending', '', 'Jun 6', 'Circle', 'Compacting scheduled.', '', '{}'),
('little-cherries', 6, 'Printing', 'pending', '', 'Jun 13', 'Circle', 'Printing scheduled.', '', '{}'),
('little-cherries', 7, 'Curing/Finishing', 'pending', '', 'Jun 20', 'Circle', 'Curing scheduled.', '', '{}'),
('little-cherries', 8, 'Pattern Making', 'pending', '', 'Jun 25', 'Circle', 'Pattern making scheduled.', '', '{}'),
('little-cherries', 9, 'Sewing', 'pending', '', 'Jun 27', 'Circle', 'Sewing scheduled.', '', '{}'),
('little-cherries', 10, 'Quality Inspection', 'pending', '', 'Jun 27', 'Circle', 'Quality inspection scheduled.', '', '{}'),
('little-cherries', 11, 'Shipping', 'pending', '', 'Jun 27', 'Circle', 'Shipping scheduled.', '', '{}')
ON CONFLICT (order_id, step_id) DO UPDATE SET
    label = EXCLUDED.label, status = EXCLUDED.status, week = EXCLUDED.week, date = EXCLUDED.date,
    icon = EXCLUDED.icon, detail = EXCLUDED.detail, schedule = EXCLUDED.schedule, week_data = EXCLUDED.week_data;

-- Seed Production Steps for 'gubbachi'
INSERT INTO production_steps (order_id, step_id, label, status, week, date, icon, detail, schedule, week_data) VALUES
('gubbachi', 1, 'Yarns', 'completed', 'Week 1 (May 25 - May 31)', 'May 31', 'Package', 'Yarns sourced.', 'Week 1', '{"0": true}'),
('gubbachi', 2, 'Weaving', 'in-progress', 'Week 2 (June 1-June 7)', 'Jun 7', 'Clock', 'Weaving in progress.', 'Week 2', '{"1": true}'),
('gubbachi', 3, 'Dyeing', 'pending', '', 'Jun 14', 'Circle', 'Dyeing scheduled.', '', '{}'),
('gubbachi', 4, 'Singering', 'pending', '', 'Jun 21', 'Circle', 'Singering scheduled.', '', '{}'),
('gubbachi', 5, 'Accessories', 'pending', '', 'Jun 28', 'Circle', 'Accessories scheduled.', '', '{}'),
('gubbachi', 6, 'Pattern Making', 'pending', '', 'Jul 5', 'Circle', 'Pattern making scheduled.', '', '{}'),
('gubbachi', 7, 'Sewing', 'pending', '', 'Jul 12', 'Circle', 'Sewing scheduled.', '', '{}'),
('gubbachi', 8, 'Quality Inspection', 'pending', '', 'Jul 19', 'Circle', 'Quality inspection scheduled.', '', '{}'),
('gubbachi', 9, 'Shipping', 'pending', '', 'Jul 19', 'Circle', 'Shipping scheduled.', '', '{}')
ON CONFLICT (order_id, step_id) DO UPDATE SET
    label = EXCLUDED.label, status = EXCLUDED.status, week = EXCLUDED.week, date = EXCLUDED.date,
    icon = EXCLUDED.icon, detail = EXCLUDED.detail, schedule = EXCLUDED.schedule, week_data = EXCLUDED.week_data;

-- Seed Production Steps for 'lil-sistas'
INSERT INTO production_steps (order_id, step_id, label, status, week, date, icon, detail, schedule, week_data) VALUES
('lil-sistas', 1, 'Yarns', 'completed', 'Week 1', 'TBD', 'Package', 'Yarns sourced.', 'Week 1', '{"0": true}'),
('lil-sistas', 2, 'Knitting & Weaving', 'in-progress', 'Week 2', 'TBD', 'Clock', 'Knitting in progress.', 'Week 2', '{"1": true}'),
('lil-sistas', 3, 'Heat Setting', 'pending', '', 'TBD', 'Circle', 'Heat setting scheduled.', '', '{}'),
('lil-sistas', 4, 'Dyeing', 'pending', '', 'TBD', 'Circle', 'Dyeing scheduled.', '', '{}'),
('lil-sistas', 5, 'Compacting', 'pending', '', 'TBD', 'Circle', 'Compacting scheduled.', '', '{}'),
('lil-sistas', 6, 'Printing', 'pending', '', 'TBD', 'Circle', 'Printing scheduled.', '', '{}'),
('lil-sistas', 7, 'Curing/Finishing', 'pending', '', 'TBD', 'Circle', 'Curing scheduled.', '', '{}'),
('lil-sistas', 8, 'Pattern Making', 'pending', '', 'TBD', 'Circle', 'Pattern making scheduled.', '', '{}'),
('lil-sistas', 9, 'Sewing', 'pending', '', 'TBD', 'Circle', 'Sewing scheduled.', '', '{}'),
('lil-sistas', 10, 'Quality Inspection', 'pending', '', 'TBD', 'Circle', 'Quality inspection scheduled.', '', '{}'),
('lil-sistas', 11, 'Shipping', 'pending', '', 'TBD', 'Circle', 'Shipping scheduled.', '', '{}')
ON CONFLICT (order_id, step_id) DO UPDATE SET
    label = EXCLUDED.label, status = EXCLUDED.status, week = EXCLUDED.week, date = EXCLUDED.date,
    icon = EXCLUDED.icon, detail = EXCLUDED.detail, schedule = EXCLUDED.schedule, week_data = EXCLUDED.week_data;

-- Seed ESG Metrics
INSERT INTO esg_metrics (order_id, organic_fiber, carbon_offset, water_recycling) VALUES
('cotton-robin', 94, 78, 96),
('little-cherries', 88, 65, 92),
('gubbachi', 90, 70, 94),
('lil-sistas', 85, 60, 90)
ON CONFLICT (order_id) DO UPDATE SET
    organic_fiber = EXCLUDED.organic_fiber,
    carbon_offset = EXCLUDED.carbon_offset,
    water_recycling = EXCLUDED.water_recycling;

-- Seed Blog Posts (Demo posts if you want, let's add one default post)
INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, status, published_at, updated_at) VALUES
('post1', 'sustainable-weaving-practices', 'Sustainable Weaving Practices in Modern Textile Mills', 'Discover how modern textile mills are reducing water and electricity waste in their weaving processes.', 'Sustainable weaving is at the heart of our mission. In this article, we explore step-by-step techniques to improve efficiency...', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d', 'Admin', 'Sustainability', ARRAY['weaving', 'sustainable', 'textile'], 'published', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    featured_image = EXCLUDED.featured_image, author = EXCLUDED.author, category = EXCLUDED.category,
    tags = EXCLUDED.tags, status = EXCLUDED.status;

-- 5. ENABLE SUPABASE REALTIME REPLICATION FOR REAL-TIME SYNC
-- Enables real-time updates on tables so dashboard updates instantly for all users
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table production_steps;
alter publication supabase_realtime add table esg_metrics;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table user_orders;
alter publication supabase_realtime add table chat_messages;


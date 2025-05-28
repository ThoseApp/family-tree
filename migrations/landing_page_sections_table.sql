-- Create landing_page_sections table for managing landing page content
CREATE TABLE IF NOT EXISTS landing_page_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type VARCHAR(50) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    content JSONB,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to published sections
CREATE POLICY "Allow public read access to published sections" ON landing_page_sections
    FOR SELECT
    USING (is_published = true);

-- Policy to allow admin full access (you may need to adjust this based on your admin setup)
CREATE POLICY "Allow admin full access to landing page sections" ON landing_page_sections
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_landing_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_landing_page_sections_updated_at
    BEFORE UPDATE ON landing_page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_page_sections_updated_at();

-- Create index on section_type for faster queries
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_section_type ON landing_page_sections(section_type);

-- Create index on is_published for faster filtering
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_published ON landing_page_sections(is_published);

-- Insert default sections
INSERT INTO landing_page_sections (section_type, title, subtitle, description, image_url, is_published) VALUES 
    ('hero', 'Welcome to the Mosuro Family', 'Connecting generations, preserving memories', 'Discover our rich family heritage, share precious moments, and stay connected with family members across the world.', '/images/landing/hero_section.webp', true),
    ('gallery_preview', 'GALLERY', 'Remembering Our Golden Days', 'A glimpse into our treasured family moments', NULL, true),
    ('upcoming_events', 'UPCOMING EVENTS', NULL, 'Stay updated with family celebrations and gatherings', '/images/landing/upcoming_events_section.webp', true),
    ('history', 'Our Family History', 'The Legacy of the Mosuro Family', 'Explore the rich heritage and stories that shaped our family through generations.', '/images/landing/makes_history.webp', true),
    ('family_members', 'The Mosuro Family', NULL, 'Get to know the amazing individuals that make up our family', NULL, true),
    ('family_tree', 'Family Tree', 'Discover Your Roots', 'Explore the connections and relationships that bind our family together across generations.', '/images/landing/family-tree-placeholder.jpg', true)
ON CONFLICT (section_type) DO NOTHING; 
-- Create the notice_boards table
CREATE TABLE IF NOT EXISTS notice_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  editor TEXT NOT NULL,
  posteddate DATE NOT NULL,
  postedtime TIME NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for the notice_boards table
ALTER TABLE notice_boards ENABLE ROW LEVEL SECURITY;

-- Policy for retrieving notices (allow all authenticated users to read)
CREATE POLICY "Allow all users to read notices" 
  ON notice_boards
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policy for creating notices (allow authenticated users to create)
CREATE POLICY "Allow authenticated users to create notices" 
  ON notice_boards
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating notices (allow authenticated users to update)
CREATE POLICY "Allow authenticated users to update notices" 
  ON notice_boards
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Policy for deleting notices (allow authenticated users to delete)
CREATE POLICY "Allow authenticated users to delete notices" 
  ON notice_boards
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_notice_boards_updated_at
BEFORE UPDATE ON notice_boards
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 
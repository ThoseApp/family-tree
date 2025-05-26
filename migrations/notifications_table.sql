-- Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'gallery_request',
  resource_id TEXT,
  user_id UUID NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for retrieving notifications (allow users to read their own notifications)
CREATE POLICY "Users can read their own notifications" 
  ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for creating notifications (allow authenticated users to create)
CREATE POLICY "Allow authenticated users to create notifications" 
  ON notifications
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating notifications (allow users to update their own notifications)
CREATE POLICY "Users can update their own notifications" 
  ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for deleting notifications (allow users to delete their own notifications)
CREATE POLICY "Users can delete their own notifications" 
  ON notifications
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_modified_column();

-- Enable realtime for notifications table
ALTER publication supabase_realtime ADD TABLE notifications; 
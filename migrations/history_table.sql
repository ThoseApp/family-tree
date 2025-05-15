CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view histories
CREATE POLICY "Allow authenticated users to view histories" 
ON public.history 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert their own histories
CREATE POLICY "Allow authenticated users to insert histories" 
ON public.history 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own histories
CREATE POLICY "Allow authenticated users to update histories" 
ON public.history 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policy to allow users to delete their own histories
CREATE POLICY "Allow authenticated users to delete histories" 
ON public.history 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Add comment to the table
COMMENT ON TABLE public.history IS 'Stores family history records and stories';
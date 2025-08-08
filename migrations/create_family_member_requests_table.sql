CREATE TABLE public.family_member_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    picture_link TEXT,
    date_of_birth DATE,
    marital_status VARCHAR(100),
    fathers_first_name VARCHAR(50),
    fathers_last_name VARCHAR(50),
    mothers_first_name VARCHAR(50),
    mothers_last_name VARCHAR(50),
    spouses_first_name VARCHAR(50),
    spouses_last_name VARCHAR(50),
    order_of_birth INTEGER,
    order_of_marriage INTEGER,
    requested_by_user_id UUID REFERENCES public.users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER handle_family_member_requests_update
BEFORE UPDATE ON public.family_member_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE public.family_member_requests ENABLE ROW LEVEL SECURITY;

-- Policies for family_member_requests
-- Admin can see all requests
CREATE POLICY "Admin can see all requests"
ON public.family_member_requests
FOR SELECT
TO authenticated;

-- Users can see their own requests
CREATE POLICY "Users can see their own requests"
ON public.family_member_requests
FOR SELECT
TO authenticated
USING (
  requested_by_user_id = auth.uid()
);

-- Users can insert new requests
CREATE POLICY "Users can insert their own requests"
ON public.family_member_requests
FOR INSERT
TO authenticated
WITH CHECK (
  requested_by_user_id = auth.uid()
);

-- Admin can update requests (to change status)
CREATE POLICY "Admin can update requests"
ON public.family_member_requests
FOR UPDATE
TO authenticated;
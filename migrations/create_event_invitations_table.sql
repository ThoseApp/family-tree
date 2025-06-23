-- Migration: Create event_invitations table
-- Description: Create table to store event invitations between family members
-- Date: 2024-01-01

CREATE TABLE IF NOT EXISTS event_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    inviter_id UUID NOT NULL,
    invitee_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_event_invitations_event_id 
        FOREIGN KEY (event_id) 
        REFERENCES events(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_event_invitations_inviter_id 
        FOREIGN KEY (inviter_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_event_invitations_invitee_id 
        FOREIGN KEY (invitee_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    
    -- Ensure unique invitations per event-invitee pair
    CONSTRAINT unique_event_invitee UNIQUE(event_id, invitee_id),
    
    -- Prevent self-invitations
    CONSTRAINT no_self_invitation CHECK (inviter_id != invitee_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_inviter_id ON event_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invitee_id ON event_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_event_invitations_created_at ON event_invitations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_invitations table

-- Users can view invitations they sent or received
CREATE POLICY "Users can view their own invitations" ON event_invitations
    FOR SELECT USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id
    );

-- Users can create invitations for events they own
CREATE POLICY "Users can create invitations for their events" ON event_invitations
    FOR INSERT WITH CHECK (
        auth.uid() = inviter_id AND
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_invitations.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- Users can update invitations they received (to respond) or sent (to cancel)
CREATE POLICY "Users can update their invitations" ON event_invitations
    FOR UPDATE USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id
    );

-- Users can delete invitations they sent
CREATE POLICY "Users can delete invitations they sent" ON event_invitations
    FOR DELETE USING (auth.uid() = inviter_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on invitation updates
CREATE TRIGGER trigger_update_event_invitations_updated_at
    BEFORE UPDATE ON event_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_invitations_updated_at(); 
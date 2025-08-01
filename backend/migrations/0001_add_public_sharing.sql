-- migrations/0001_add_public_sharing.sql

-- Add public sharing fields to diagrams table
ALTER TABLE diagrams ADD COLUMN public_share_id TEXT NULL;
ALTER TABLE diagrams ADD COLUMN public_share_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE diagrams ADD COLUMN public_share_expires_at TIMESTAMP NULL;

-- Create index for faster public share lookups
CREATE INDEX idx_diagrams_public_share_id ON diagrams(public_share_id);

-- Add role column to diagram_collaborators table
ALTER TABLE diagram_collaborators ADD COLUMN role TEXT DEFAULT 'editor';
ALTER TABLE diagram_collaborators ADD COLUMN invited_at TIMESTAMP NULL;
ALTER TABLE diagram_collaborators ADD COLUMN status TEXT DEFAULT 'accepted';
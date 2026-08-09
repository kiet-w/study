-- Migration: 20260809_subjects.sql
-- Description: Create subjects table with RLS and index

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Users can view their own subjects"
  ON subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects"
  ON subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
  ON subjects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
  ON subjects FOR DELETE
  USING (auth.uid() = user_id);

-- Create Index on user_id
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects (user_id);

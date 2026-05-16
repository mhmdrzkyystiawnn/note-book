-- Create countdowns table
CREATE TABLE countdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_countdown_user_id ON countdowns(user_id);

-- Enable Row Level Security
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own countdowns" 
  ON countdowns FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own countdowns" 
  ON countdowns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own countdowns" 
  ON countdowns FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own countdowns" 
  ON countdowns FOR DELETE 
  USING (auth.uid() = user_id);

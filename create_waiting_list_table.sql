-- Create waiting_list table for Waiting List functionality
CREATE TABLE IF NOT EXISTS waiting_list (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  desired_period TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (since this is a simple app)
CREATE POLICY "Allow all operations for waiting_list" ON waiting_list
  FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_created_at ON waiting_list(created_at);

-- Insert sample data (optional)
-- INSERT INTO waiting_list (id, name, email, phone, desired_period, notes) VALUES
--   ('wl-1', 'Test Client 1', 'test1@example.com', '+37060000001', 'W-45, W-46', 'Sample waiting list client'),
--   ('wl-2', 'Test Client 2', 'test2@example.com', '+37060000002', 'W-47', 'Another sample client');

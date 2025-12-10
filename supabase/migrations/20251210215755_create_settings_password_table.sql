/*
  # Create Settings Password Table

  1. New Tables
    - `settings_password`
      - `id` (uuid, primary key)
      - `password_hash` (text) - Hashed password for settings access
      - `authorized_email` (text) - Email authorized to reset password
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `settings_password` table
    - Add policy for public read access (for password verification)
    - Add policy for public update access (for password reset)

  3. Initial Data
    - Create initial password entry with default password hash
*/

-- Create settings_password table
CREATE TABLE IF NOT EXISTS settings_password (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  authorized_email text NOT NULL DEFAULT 'amigoslakokido@gmail.com',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings_password ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read settings password"
  ON settings_password
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update settings password"
  ON settings_password
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert initial password entry
-- Default password: "adminstrasjon"
-- Using a simple hash for demonstration (in production, you'd use bcrypt or similar)
INSERT INTO settings_password (password_hash, authorized_email)
VALUES (
  encode(digest('adminstrasjon', 'sha256'), 'hex'),
  'amigoslakokido@gmail.com'
)
ON CONFLICT DO NOTHING;
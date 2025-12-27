/*
  # Create Multi-Tenant Companies System
  
  1. New Tables
    - `companies`
      - `id` (uuid, primary key) - Unique identifier for each company
      - `name` (text) - Company name
      - `address` (text) - Company address
      - `phone` (text) - Company phone
      - `email` (text) - Company email
      - `org_number` (text) - Organization number
      - `created_at` (timestamptz) - When company was added
      - `updated_at` (timestamptz) - Last update time
      - `is_active` (boolean) - Whether company is active
  
  2. Initial Data
    - Add Amigos La Kokido AS
    - Add Actic FLAVORS AS
    
  3. Security
    - Enable RLS on companies table
    - Allow public read access to companies (for switching)
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  org_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read companies (needed for company switcher)
CREATE POLICY "Allow public read access to companies"
  ON companies
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to update companies
CREATE POLICY "Allow authenticated users to update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert the two companies
INSERT INTO companies (name, address, phone, email, org_number) VALUES
  ('Amigos La Kokido AS', 'Existing Address', 'Existing Phone', 'existing@email.com', '123456789'),
  ('Actic FLAVORS AS', 'Rambergveien 45, 3115 Tønsberg', '41 19 09 00', 'arcticflavorsno@gmail.com', '934596978')
ON CONFLICT DO NOTHING;
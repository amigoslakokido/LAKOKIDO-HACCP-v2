/*
  # Fix Environment Tables RLS Policies for Public Access
  
  ## Description
  The application doesn't use authentication, but environment tables require
  authenticated users. This migration changes all environment table policies
  to allow public access.
  
  ## Changes
  - Drop existing authenticated-only policies
  - Create new public access policies for all environment tables
  
  ## Tables affected
  - hms_environment_cleaning_products
  - hms_environment_frying_oil
  - hms_environment_goals
  - hms_environment_grease_trap
  - hms_environment_green_transport
  - hms_environment_waste
*/

-- Drop existing policies for hms_environment_cleaning_products
DROP POLICY IF EXISTS "Users can view cleaning products" ON hms_environment_cleaning_products;
DROP POLICY IF EXISTS "Users can insert cleaning products" ON hms_environment_cleaning_products;
DROP POLICY IF EXISTS "Users can update cleaning products" ON hms_environment_cleaning_products;
DROP POLICY IF EXISTS "Users can delete cleaning products" ON hms_environment_cleaning_products;

-- Create public policies for hms_environment_cleaning_products
CREATE POLICY "Anyone can view cleaning products"
  ON hms_environment_cleaning_products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert cleaning products"
  ON hms_environment_cleaning_products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update cleaning products"
  ON hms_environment_cleaning_products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cleaning products"
  ON hms_environment_cleaning_products FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for hms_environment_frying_oil
DROP POLICY IF EXISTS "Users can view frying oil records" ON hms_environment_frying_oil;
DROP POLICY IF EXISTS "Users can insert frying oil records" ON hms_environment_frying_oil;
DROP POLICY IF EXISTS "Users can update frying oil records" ON hms_environment_frying_oil;
DROP POLICY IF EXISTS "Users can delete frying oil records" ON hms_environment_frying_oil;

-- Create public policies for hms_environment_frying_oil
CREATE POLICY "Anyone can view frying oil records"
  ON hms_environment_frying_oil FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert frying oil records"
  ON hms_environment_frying_oil FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update frying oil records"
  ON hms_environment_frying_oil FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete frying oil records"
  ON hms_environment_frying_oil FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for hms_environment_goals
DROP POLICY IF EXISTS "Users can view environmental goals" ON hms_environment_goals;
DROP POLICY IF EXISTS "Users can insert environmental goals" ON hms_environment_goals;
DROP POLICY IF EXISTS "Users can update environmental goals" ON hms_environment_goals;
DROP POLICY IF EXISTS "Users can delete environmental goals" ON hms_environment_goals;

-- Create public policies for hms_environment_goals
CREATE POLICY "Anyone can view environmental goals"
  ON hms_environment_goals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert environmental goals"
  ON hms_environment_goals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update environmental goals"
  ON hms_environment_goals FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete environmental goals"
  ON hms_environment_goals FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for hms_environment_grease_trap
DROP POLICY IF EXISTS "Users can view grease trap records" ON hms_environment_grease_trap;
DROP POLICY IF EXISTS "Users can insert grease trap records" ON hms_environment_grease_trap;
DROP POLICY IF EXISTS "Users can update grease trap records" ON hms_environment_grease_trap;
DROP POLICY IF EXISTS "Users can delete grease trap records" ON hms_environment_grease_trap;

-- Create public policies for hms_environment_grease_trap
CREATE POLICY "Anyone can view grease trap records"
  ON hms_environment_grease_trap FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert grease trap records"
  ON hms_environment_grease_trap FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update grease trap records"
  ON hms_environment_grease_trap FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete grease trap records"
  ON hms_environment_grease_trap FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for hms_environment_green_transport
DROP POLICY IF EXISTS "Users can view green transport" ON hms_environment_green_transport;
DROP POLICY IF EXISTS "Users can insert green transport" ON hms_environment_green_transport;
DROP POLICY IF EXISTS "Users can update green transport" ON hms_environment_green_transport;
DROP POLICY IF EXISTS "Users can delete green transport" ON hms_environment_green_transport;

-- Create public policies for hms_environment_green_transport
CREATE POLICY "Anyone can view green transport"
  ON hms_environment_green_transport FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert green transport"
  ON hms_environment_green_transport FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update green transport"
  ON hms_environment_green_transport FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete green transport"
  ON hms_environment_green_transport FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for hms_environment_waste
DROP POLICY IF EXISTS "Users can view waste records" ON hms_environment_waste;
DROP POLICY IF EXISTS "Users can insert waste records" ON hms_environment_waste;
DROP POLICY IF EXISTS "Users can update waste records" ON hms_environment_waste;
DROP POLICY IF EXISTS "Users can delete waste records" ON hms_environment_waste;

-- Create public policies for hms_environment_waste
CREATE POLICY "Anyone can view waste records"
  ON hms_environment_waste FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert waste records"
  ON hms_environment_waste FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update waste records"
  ON hms_environment_waste FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete waste records"
  ON hms_environment_waste FOR DELETE
  TO public
  USING (true);
